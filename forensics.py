"""Deterministic local image diagnostics used by VeriSight's v1 analysis API."""
from io import BytesIO
from PIL import Image, ImageChops, ImageEnhance, ExifTags
import hashlib, re, shutil, subprocess, tempfile

MAX_SIDE=1200

def analyze_image(blob: bytes) -> dict:
    im=Image.open(BytesIO(blob)); im.verify(); im=Image.open(BytesIO(blob)).convert('RGB')
    original=(im.width,im.height); im.thumbnail((MAX_SIDE,MAX_SIDE)); rgb=im
    sha=hashlib.sha256(blob).hexdigest()
    fmt=Image.open(BytesIO(blob)).format or 'unknown'
    ela=[]; maps=[]
    for q in (75,85,95):
        buf=BytesIO();rgb.save(buf,format='JPEG',quality=q);buf.seek(0);rec=Image.open(buf).convert('RGB')
        diff=ImageChops.difference(rgb,rec); gray=diff.convert('L'); stats=gray.getextrema()
        avg=sum(gray.resize((min(128,gray.width),min(128,gray.height))).convert('L').getdata())/(min(128,gray.width)*min(128,gray.height))
        ela.append({'quality':q,'mean_difference':round(avg,3),'max_difference':stats[1]})
        if q==85: maps.append(ImageEnhance.Contrast(diff).enhance(4))
    # Haar-like 2x2 high-pass residual energy and 8-pixel boundary discontinuity.
    gray=rgb.convert('L'); w,h=gray.size; px=gray.load(); residual=0.; n=0; blocks=[]
    for y in range(1,h-1,2):
        for x in range(1,w-1,2):
            a,b,c,d=px[x,y],px[x+1,y],px[x,y+1],px[x+1,y+1]
            residual += abs(a-b)+abs(a-c)+abs(d-b)+abs(d-c); n+=4
    for x in range(8,w,8):
        s=0
        for y in range(h):s+=abs(px[x,y]-px[x-1,y])
        blocks.append(s/max(1,h))
    grid_mean=sum(blocks)/max(1,len(blocks)); grid_peak=max(blocks,default=0)
    # JPEG marker scan: quantization tables, sampling factors, dimensions and EXIF presence.
    dqt=False; subsampling='unknown'; exif_present=False
    raw=blob
    if raw[:2]==b'\xff\xd8':
        i=2
        while i+4<len(raw):
            if raw[i]!=255: i+=1;continue
            marker=raw[i+1];i+=2
            if marker in (0xD9,0xDA):break
            if i+2>len(raw):break
            ln=int.from_bytes(raw[i:i+2],'big')
            if ln<2:break
            seg=raw[i+2:i+ln]
            if marker==0xDB:dqt=True
            if marker==0xE1 and seg.startswith(b'Exif\0\0'):exif_present=True
            if marker==0xC0 and len(seg)>=7:
                nf=seg[5]; comps=seg[6:6+nf*3]
                if len(comps)>=3:
                    samp=comps[1]
                    subsampling='4:2:0' if samp==0x22 else ('4:2:2' if samp==0x21 else ('4:4:4' if samp==0x11 else hex(samp)))
            i+=ln
    try: exif_present=exif_present or bool(Image.open(BytesIO(blob)).getexif())
    except Exception:pass
    channel='WhatsApp-like recompression suspected' if (fmt=='JPEG' and max(original)<=1600 and subsampling=='4:2:0' and not exif_present) else 'No strong forwarding fingerprint'
    # OCR is optional: when Tesseract is installed, recognized words and boxes are emitted.
    ocr={'status':'unavailable','engine':None,'text':'','words':[]}
    exe=shutil.which('tesseract')
    if exe:
        try:
            with tempfile.NamedTemporaryFile(suffix='.png') as f:
                rgb.save(f.name); p=subprocess.run([exe,f.name,'stdout','tsv'],capture_output=True,text=True,timeout=8)
            words=[]; lines=[]
            for row in p.stdout.splitlines()[1:]:
                c=row.split('\t')
                if len(c)>=12 and c[11].strip() and c[0].isdigit():
                    x,y,bw,bh=map(int,c[6:10]);words.append({'text':c[11],'box':[round(x/w,4),round(y/h,4),round(bw/w,4),round(bh/h,4)],'confidence':float(c[10]) if c[10] else 0})
            ocr={'status':'complete','engine':'Tesseract','text':' '.join(z['text'] for z in words),'words':words}
        except Exception as e:ocr={'status':'error','engine':'Tesseract','text':'','words':[],'detail':str(e)}
    txt=ocr['text']; utr=bool(re.search(r'(?<!\d)\d{12}(?!\d)',txt)); vpa=bool(re.search(r'\b[\w.-]{2,}@[\w.-]{2,}\b',txt))
    findings=[{'layer':'L1','severity':'info','title':f'ELA sweep at Q{v["quality"]}','detail':f'Mean difference {v["mean_difference"]}, maximum {v["max_difference"]}.'} for v in ela]
    findings += [{'layer':'L1','severity':'info','title':'High-pass / block grid','detail':f'Haar-like residual mean {residual/max(1,n):.2f}; 8-pixel boundary mean {grid_mean:.2f}, peak {grid_peak:.2f}.'},
    {'layer':'L2','severity':'info' if ocr['status']=='complete' else 'unavailable','title':'OCR geometry','detail':f'{len(ocr["words"])} recognized word boxes.' if ocr['status']=='complete' else 'Tesseract is not installed; OCR-based geometry and text rules unavailable.'},
    {'layer':'L3','severity':'info','title':'Image metadata and channel','detail':f'{fmt}, {original[0]}x{original[1]}, DQT={dqt}, subsampling={subsampling}, EXIF={exif_present}; {channel}.'}]
    if ocr['status']=='complete':
        findings += [{'layer':'L3','severity':'review' if not utr else 'info','title':'UPI UTR format','detail':'12-digit UTR-like value found.' if utr else 'No 12-digit UTR-like value recognized; absence is not proof of fraud.'}, {'layer':'L3','severity':'info' if vpa else 'review','title':'VPA pattern','detail':'VPA-like string found.' if vpa else 'No VPA-like string recognized.'}]
    return {'schema_version':'1.0','sha256':sha,'image':{'format':fmt,'width':original[0],'height':original[1]},'channel':channel,'layers':{'pixel_frequency':{'status':'complete','ela':ela,'haar_residual_mean':round(residual/max(1,n),3),'block8_boundary_mean':round(grid_mean,3),'block8_boundary_peak':round(grid_peak,3)},'ocr_geometry':ocr,'metadata_protocol':{'status':'partial','dqt':dqt,'subsampling':subsampling,'exif_present':exif_present,'utr_12_digit_found':utr if ocr['status']=='complete' else None,'vpa_like_found':vpa if ocr['status']=='complete' else None},'ensemble':{'status':'partial','note':'No calibrated fraud probability or C2PA trust validation is configured.'}},'score':None,'verdict':'REVIEW','findings':findings,'limitations':['ELA differences are diagnostic, not calibrated proof of tampering.','UPI regex only checks recognized text format; it cannot verify settlement or issuer validity.','C2PA cryptographic trust-chain verification is not configured.']}
