import cv2
import numpy as np
from typing import Any



def inspect_image_metadata(
    image_bytes: bytes,
    filename: str = "screenshot.png"
) -> dict[str, Any]:
    """
    Examines container chunks, EXIF metadata, PNG chunks, and software tags.
    """
    metadata_info = {
        "format": "UNKNOWN",
        "has_exif": False,
        "exif_tags_count": 0,
        "software": None,
        "creation_time": None,
        "icc_profile": None,
        "png_chunks": [],
        "c2pa_marker_found": False
    }

    # 1. Check for C2PA marker in raw bytes
    # C2PA embeds in JPEG/PNG via JUMBF box (marker 'jumbf' or 'c2pa')
    if b'jumbf' in image_bytes or b'c2pa' in image_bytes:
        metadata_info["c2pa_marker_found"] = True

    # Inspect PNG chunks and common JPEG metadata markers without bringing a second image stack.
    if image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        metadata_info["format"] = "PNG"
        offset = 8
        while offset + 12 <= len(image_bytes):
            length = int.from_bytes(image_bytes[offset:offset+4], "big")
            kind = image_bytes[offset+4:offset+8]
            data = image_bytes[offset+8:offset+8+length]
            if len(data) != length: break
            if kind == b"iCCP": metadata_info["icc_profile"] = "Embedded Profile Present"
            if kind in (b"tEXt", b"iTXt", b"zTXt"):
                label = data.split(b"\0", 1)[0].decode("latin1", "replace")
                value = data.split(b"\0", 1)[-1][:512].decode("latin1", "replace")
                metadata_info["png_chunks"].append(f"{label}: {value}")
                if "software" in label.lower(): metadata_info["software"] = value
            offset += length + 12
            if kind == b"IEND": break
    elif image_bytes.startswith(b"\xff\xd8"):
        metadata_info["format"] = "JPEG"
        offset = 2
        while offset + 4 <= len(image_bytes) and image_bytes[offset] == 255:
            marker = image_bytes[offset+1]
            length = int.from_bytes(image_bytes[offset+2:offset+4], "big")
            if length < 2: break
            data = image_bytes[offset+4:offset+2+length]
            if marker == 0xE1 and data.startswith(b"Exif\0\0"):
                metadata_info["has_exif"] = True
                metadata_info["exif_tags_count"] = 1
            if marker == 0xE2 and data.startswith(b"ICC_PROFILE"):
                metadata_info["icc_profile"] = "Embedded Profile Present"
            offset += 2 + length
            if marker == 0xDA: break
    else:
        metadata_info["format"] = "IMAGE"

    # 4. Detect known generator signatures
    known_generators = ['FakeGen', 'FakeReceipt', 'HTML2Canvas', 'CanvasCapture', 'Photoshop', 'Canva', 'GIMP', 'Figma']
    sw = metadata_info.get("software") or ""
    for gen in known_generators:
        if gen.lower() in sw.lower():
            metadata_info["software_signature"] = gen
            break

    return metadata_info
