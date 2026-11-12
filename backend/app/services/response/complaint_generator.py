import uuid
from datetime import datetime
from typing import Any

from app.services.response.models import (
    ExtractedIncidentDetails,
    FormalComplaint,
    GenerateComplaintRequest,
)

TRANSLATIONS = {
    "hi": {
        "title_prefix": "औपचारिक साइबर अपराध शिकायत",
        "to_authority": "सेवा में, नोडल अधिकारी / साइबर अपराध जांच प्रभाग",
        "subject_prefix": "विषय: डिजिटल वित्तीय धोखाधड़ी एवं संदिग्ध भुगतान रसीद की औपचारिक शिकायत",
        "sir_madam": "महोदय / महोदया,",
        "personal_exp": "शिकायतकर्ता का प्रत्यक्ष विवरण",
        "counterparty_claims": "प्रतिवादी/संदिग्ध द्वारा किए गए दावे",
        "screenshot_obs": "प्रस्तुत स्क्रीनशॉट का दृश्य विवरण",
        "forensic_obs": "वेरीसाइट (VeriSight) फोरेंसिक विश्लेषण एवं तकनीकी अवलोकन",
        "financial_details": "वित्तीय एवं लेन-देन विवरण",
        "suspected_entity": "संदिग्ध व्यक्ति अथवा संस्था का विवरण",
        "requested_actions": "प्रार्थना एवं अपेक्षित विधिक कार्रवाई",
        "action_freeze": "1. कृपया मामले की जांच कर लागू प्रक्रिया के अनुसार उचित कदम उठाएं।",
        "action_sec91": "2. आवश्यक होने पर संबंधित डिजिटल अभिलेखों के संबंध में लागू कानूनी प्रक्रिया अपनाएं।",
        "action_investigate": "3. कृपया उपलब्ध जानकारी और संलग्न अभिलेखों की समीक्षा करें।",
        "disclaimer_text": "अस्वीकरण: यह तकनीकी सारांश वेरीसाइट फोरेंसिक प्लेटफॉर्म द्वारा साक्ष्य संगठन के उद्देश्य से तैयार किया गया है। यह कोई आधिकारिक पुलिस रिपोर्ट या न्यायिक निर्णय नहीं है।"
    },
    "kn": {
        "title_prefix": "ಔಪಚಾರಿಕ ಸೈಬರ್ ಕ್ರೈಮ್ ದೂರು",
        "to_authority": "ಮಾನ್ಯ ನೊಡಲ್ ಅಧಿಕಾರಿ / ಸೈಬರ್ ಕ್ರೈಮ್ ತನಿಖಾ ವಿಭಾಗ",
        "subject_prefix": "ವಿಷಯ: ಡಿಜಿಟಲ್ ಪಾವತಿ ವಂಚನೆ ಮತ್ತು ನಕಲಿ ರಶೀದಿಯ ಕುರಿತು ದೂರು",
        "sir_madam": "ಮಾನ್ಯರೇ,",
        "personal_exp": "ದೂರುದಾರರ ವೈಯಕ್ತಿಕ ಅನುಭವ ಮತ್ತು ಘಟನೆ ವಿವರ",
        "counterparty_claims": "ಎದುರುದಾರರು / ಶಂಕಿತರು ನೀಡಿದ ಹೇಳಿಕೆಗಳು",
        "screenshot_obs": "ಪಾವತಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ನ ದೃಶ್ಯ ಪರಿಶೀಲನೆ ವಿವರ",
        "forensic_obs": "ವೆರಿಸೈಟ್ (VeriSight) ಫೋರೆನ್ಸಿಕ್ ತಾಂತ್ರಿಕ ವೀಕ್ಷಣೆಗಳು",
        "financial_details": "ಹಣಕಾಸು ಮತ್ತು ವಹಿವಾಟು ವಿವರಗಳು",
        "suspected_entity": "ಶಂಕಿತ ವ್ಯಕ್ತಿ ಅಥವಾ ಸಂಸ್ಥೆಯ ವಿವರಗಳು",
        "requested_actions": "ಕೋರಿಕೊಂಡಿರುವ ತನಿಖಾ ಕ್ರಮಗಳು",
        "action_freeze": "1. ದಯವಿಟ್ಟು ಪ್ರಕರಣವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಅನ್ವಯಿಸುವ ಪ್ರಕ್ರಿಯೆಯಂತೆ ಸೂಕ್ತ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.",
        "action_sec91": "2. ಅಗತ್ಯವಿದ್ದಲ್ಲಿ ಸಂಬಂಧಿತ ಡಿಜಿಟಲ್ ದಾಖಲೆಗಳನ್ನು ಕಾನೂನು ಪ್ರಕ್ರಿಯೆಯಂತೆ ಸಂರಕ್ಷಿಸುವುದನ್ನು ಪರಿಗಣಿಸಿ.",
        "action_investigate": "3. ಲಭ್ಯವಿರುವ ಮಾಹಿತಿ ಮತ್ತು ಲಗತ್ತಿಸಿದ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
        "disclaimer_text": "ಹಕ್ಕುತ್ಯಾಗ: ಈ ತಾಂತ್ರಿಕ ವರದಿಯು ವೆರಿಸೈಟ್ ಫೋರೆನ್ಸಿಕ್ ವ್ಯವಸ್ಥೆಯಿಂದ ಸಿದ್ಧಪಡಿಸಲಾದ ಮಾಹಿತಿ ಸಂಗ್ರಹವಾಗಿದ್ದು, ಇದು ನ್ಯಾಯಾಲಯದ ಪ್ರಮಾಣೀಕರಣ ಅಥವಾ ಅಧಿಕೃತ ಪೊಲೀಸ್ ವರದಿಯಲ್ಲ."
    },
    "bn": {
        "title_prefix": "আনুষ্ঠানিক সাইবার অপরাধের অভিযোগ",
        "to_authority": "মাননীয় নোডাল অফিসার / সাইবার ক্রাইম তদন্ত বিভাগ",
        "subject_prefix": "বিষয়: ডিজিটাল আর্থিক প্রতারণা ও জাল পেমেন্ট স্ক্রিনশটের অভিযোগ",
        "sir_madam": "মহাশয় / মহাশয়া,",
        "personal_exp": "অভিযোগকারীর প্রত্যক্ষ বিবরণ",
        "counterparty_claims": "সন্দেহভাজন ব্যক্তির দাবি",
        "screenshot_obs": "পেমেন্ট স্ক্রিনশটের দৃশ্যমান বিবরণ",
        "forensic_obs": "ভ্যারিসাইট (VeriSight) ফরেনসিক পর্যবেক্ষণ",
        "financial_details": "আর্থিক ও লেনদেনের বিবরণ",
        "suspected_entity": "সন্দেহভাজন ব্যক্তি বা সংস্থার বিবরণ",
        "requested_actions": "প্রয়োজনীয় আইনি ব্যবস্থা গ্রহণের আবেদন",
        "action_freeze": "১. অনুগ্রহ করে বিষয়টি তদন্ত করে প্রযোজ্য প্রক্রিয়া অনুযায়ী উপযুক্ত ব্যবস্থা বিবেচনা করুন।",
        "action_sec91": "২. প্রয়োজন হলে প্রযোজ্য আইনি প্রক্রিয়া অনুযায়ী সংশ্লিষ্ট ডিজিটাল রেকর্ড সংরক্ষণের বিষয়টি বিবেচনা করুন।",
        "action_investigate": "৩. উপলব্ধ তথ্য ও সংযুক্ত নথি পর্যালোচনা করুন।",
        "disclaimer_text": "দাবিত্যাগ: এই প্রযুক্তিগত ফরেনসিক সারাংশটি ভ্যারিসাইট সিস্টেম দ্বারা প্রমাণ সংগঠনের জন্য তৈরি, এটি কোনও আনুষ্ঠানিক পুলিশ রিপোর্ট নয়।"
    },
    "ta": {
        "title_prefix": "முறையான இணையவழி குற்றப் புகார்",
        "to_authority": "மதிப்பிற்குரிய சைபர் குற்றப் பிரிவு ஆய்வாளர் அவர்களுக்கு",
        "subject_prefix": "பொருள்: டிஜிட்டல் பண மோசடி மற்றும் போலி ரசீது தொடர்பான புகார்",
        "sir_madam": "மதிப்பிற்குரிய ஐயா / அம்மா,",
        "personal_exp": "புகார்தாரரின் நேரடி அனுபவ விவரம்",
        "counterparty_claims": "எதிர் தரப்பினர் கூறிய தகவல்கள்",
        "screenshot_obs": "காட்டப்பட்ட ரசீது குறித்த விவரம்",
        "forensic_obs": "வெரிசைட் (VeriSight) தடயவியல் தொழில்நுட்பக் குறிப்புகள்",
        "financial_details": "நிதி மற்றும் பரிவர்த்தனை விவரங்கள்",
        "suspected_entity": "சந்தேகத்திற்குரிய நபர் / நிறுவனம்",
        "requested_actions": "கோரப்படும் சட்ட நடவடிக்கைகள்",
        "action_freeze": "1. இந்த விவகாரத்தை விசாரித்து, பொருந்தும் நடைமுறையின்படி உரிய நடவடிக்கையைப் பரிசீலிக்கவும்.",
        "action_sec91": "2. தேவைப்பட்டால் பொருந்தும் சட்ட நடைமுறையின்படி தொடர்புடைய டிஜிட்டல் பதிவுகளைப் பாதுகாப்பதைப் பரிசீலிக்கவும்.",
        "action_investigate": "3. கிடைக்கும் தகவல் மற்றும் இணைக்கப்பட்ட ஆவணங்களைப் பரிசீலிக்கவும்.",
        "disclaimer_text": "பொறுப்புத் துறப்பு: இது வெரிசைட் தடயவியல் தளத்தால் சான்றுகளை ஒழுங்கமைக்க உருவாக்கப்பட்ட தொழில்நுட்ப அறிக்கை மட்டுமே; இது நீதிமன்ற உத்தரவு அல்ல."
    },
    "te": {
        "title_prefix": "అధికారిక సైబర్ క్రైమ్ ఫిర్యాదు",
        "to_authority": "గౌరవనీయ సైబర్ క్రైమ్ ఇన్వెస్టిగేషన్ అధికారి గారికి",
        "subject_prefix": "విషయం: డిజిటల్ ఆర్థిక మోసం మరియు నకిలీ రశీదుపై అధికారిక ఫిర్యాదు",
        "sir_madam": "అయ్యా / అమ్మా,",
        "personal_exp": "ఫిర్యాదుదారుడి ప్రత్యక్ష వివరణ",
        "counterparty_claims": "అనుమానితుడు చేసిన ప్రకటనలు",
        "screenshot_obs": "చెల్లింపు స్క్రీన్‌షాట్ పరిశీలన",
        "forensic_obs": "వెరిసైట్ (VeriSight) ఫోరెన్సిక్ సాంకేతిక విశ్లేషణ",
        "financial_details": "ఆర్థిక మరియు లావాదేవీల వివరాలు",
        "suspected_entity": "అనుమానిత వ్యక్తి లేదా సంస్థ వివరాలు",
        "requested_actions": "అభ్యర్థించిన దర్యాప్తు చర్యలు",
        "action_freeze": "1. దయచేసి ఈ విషయాన్ని పరిశీలించి, వర్తించే విధానం ప్రకారం తగిన చర్యను పరిగణించండి.",
        "action_sec91": "2. అవసరమైతే వర్తించే చట్టపరమైన విధానం ప్రకారం సంబంధిత డిజిటల్ రికార్డులను భద్రపరచడాన్ని పరిగణించండి.",
        "action_investigate": "3. అందుబాటులో ఉన్న సమాచారం మరియు జతచేసిన రికార్డులను పరిశీలించండి.",
        "disclaimer_text": "గమనిక: ఈ నివేదిక వెరిసైట్ ఫోరెన్సిక్ సిస్టమ్ ద్వారా ఆధారాల కోసం రూపొందించబడింది, ఇది అధికారిక పోలీసు లేదా న్యాయపరమైన ధృవీకరణ కాదు."
    },
    "mr": {
        "title_prefix": "औपचारिक सायबर गुन्हे तक्रार",
        "to_authority": "मा. सायबर गुन्हे अन्वेषण अधिकारी,",
        "subject_prefix": "विषय: डिजिटल पेमेंट फसवणूक आणि बनावट पावतीबाबत तक्रार",
        "sir_madam": "महोदय / महोदया,",
        "personal_exp": "तक्रारदाराचा थेट अनुभव आणि घटनाक्रम",
        "counterparty_claims": "संशयित व्यक्तीने केलेले दावे",
        "screenshot_obs": "पेमेंट स्क्रीनशॉटचे दृश्य निरीक्षण",
        "forensic_obs": "व्हेरीसाईट (VeriSight) फॉरेन्सिक तांत्रिक निरीक्षणे",
        "financial_details": "आर्थिक आणि व्यवहार तपशील",
        "suspected_entity": "संशयित व्यक्ती किंवा खात्याचा तपशील",
        "requested_actions": "मागणी केलेली कायदेशीर कारवाई",
        "action_freeze": "१. कृपया या बाबीची चौकशी करून लागू प्रक्रियेनुसार योग्य कारवाईचा विचार करावा.",
        "action_sec91": "२. आवश्यक असल्यास लागू कायदेशीर प्रक्रियेनुसार संबंधित डिजिटल नोंदी जतन करण्याचा विचार करावा.",
        "action_investigate": "३. उपलब्ध माहिती आणि जोडलेली कागदपत्रे तपासावीत.",
        "disclaimer_text": "अस्वीकरण: हा तांत्रिक सारांश व्हेरीसाईट फॉरेन्सिक प्लॅटफॉर्मद्वारे पुरावा संकलनासाठी तयार केला आहे, हा न्यायालयीन निकाल नाही."
    },
    "en": {
        "title_prefix": "FORMAL CYBERCRIME INCIDENT REPORT",
        "to_authority": "To: The Investigating Officer / Cyber Crime Police Station / Nodal Grievance Officer",
        "subject_prefix": "SUBJECT: Formal Complaint Regarding Financial Cyber Incident & Fraudulent Digital Evidence",
        "sir_madam": "Respected Officer / Grievance Authority,",
        "personal_exp": "1. Complainant's Personal Direct Experience",
        "counterparty_claims": "2. Statements & Representations Made by Counterparty",
        "screenshot_obs": "3. Visual Representation of Disputed Screenshot",
        "forensic_obs": "4. VeriSight Multi-Spectral Forensic Observations",
        "financial_details": "5. Financial Impact & Transaction Specifics",
        "suspected_entity": "6. Suspected Entity & Counterparty Identifiers",
        "requested_actions": "7. Requested Law Enforcement & Protective Actions",
        "action_freeze": "1. Please review the reported events and consider any action available under the applicable process.",
        "action_sec91": "2. If needed, please consider preservation of relevant digital records through the applicable legal process.",
        "action_investigate": "3. Please review the available information and attached records.",
        "disclaimer_text": "DISCLAIMER: This technical forensic dossier is prepared through the VeriSight forensic system to assist the complainant in presenting structured evidence. VeriSight risk metrics represent signal analysis and do not constitute a legal conclusion or police investigation certificate."
    }
}


def build_forensic_observations_text(report: dict[str, Any] | None) -> list[str]:
    if not report:
        return [
            "No automated forensic screenshot analysis has been attached to this complaint.",
            "Visual evidence is submitted as originally received by the complainant."
        ]

    obs: list[str] = []
    file_hash = report.get("file_sha256", "N/A")
    tamper_score = report.get("overall_tamper_score", 0.0)
    verdict = report.get("verdict", "UNKNOWN")
    width = report.get("image_width", 0)
    height = report.get("image_height", 0)

    obs.append(f"Forensic Integrity Hash: SHA-256 {file_hash} (Image Dimensions: {width}x{height}px).")
    obs.append(f"Heuristic image-review points: {tamper_score:.1f}/100 (evidence state: {verdict}; not a probability or proof of editing).")

    findings = report.get("findings", [])
    if findings:
        obs.append(f"Candidate review cues returned: {len(findings)} across the configured heuristic checks:")
        for idx, f in enumerate(findings[:4], 1):
            title = f.get("title", "Anomaly")
            desc = f.get("description", "")
            metric = f.get("metric_name", "")
            val = f.get("metric_value", "")
            obs.append(f"  • Flag {idx} [{f.get('severity', 'HIGH')}]: {title} — {desc} ({metric}: {val}).")

    synergy = report.get("synergy", {})
    if synergy.get("synergy_multiplier_applied"):
        obs.append(f"Multi-Signal Review Cue: {synergy.get('synergy_explanation', 'The analyzer reported a spatial overlap between heuristic image regions; this is not proof of editing.')}")

    obs.append("Forensic Limitation: Image compression (such as WhatsApp forwarding) can introduce secondary artifacts; observations reflect mathematical signal anomalies.")
    return obs


def generate_formal_complaint(request: GenerateComplaintRequest) -> FormalComplaint:
    d = request.details
    lang = request.language if request.language in TRANSLATIONS else "en"
    t = TRANSLATIONS[lang]
    comp_id = f"VS-CMP-{uuid.uuid4().hex[:8].upper()}"

    # Destination mapping
    auth_destinations = {
        "NATIONAL_CYBER_CRIME_PORTAL": (
            "National Cyber Crime Reporting Portal (NCRP) / 1930 Helpline",
            "https://cybercrime.gov.in"
        ),
        "BANK_UPI_PSP": (
            f"Bank Grievance Redressal / {d.bank_or_upi_provider or 'Payment Service Provider'}",
            "https://www.npci.org.in"
        ),
        "RBI_CMS_OMBUDSMAN": (
            "Reserve Bank of India (RBI) Integrated Ombudsman / CMS",
            "https://cms.rbi.org.in"
        ),
        "POLICE_CYBER_CELL": (
            "District Cyber Crime Police Station / Jurisdictional Police Station",
            "https://cybercrime.gov.in"
        ),
        "PLATFORM_ABUSE": (
            f"{d.communication_channel or 'Platform'} Cyber Grievance Officer",
            "https://gac.gov.in"
        ),
    }

    auth_name, auth_url = auth_destinations.get(
        request.authority_destination,
        ("National Cyber Crime Reporting Portal (NCRP)", "https://cybercrime.gov.in")
    )

    # Chronological breakdown
    forensic_obs = build_forensic_observations_text(request.attached_forensic_report)

    # Personal direct experience
    personal_exp = (
        request.custom_narrative_edits or
        f"I, {d.complainant_name or 'the complainant'}, state that on {d.incident_date or 'the date of incident'} "
        f"at approximately {d.approximate_time or 'the stated time'}, I experienced the following cyber incident: "
        f"{d.narrative_description}"
    )

    # Counterparty claims
    counterparty_claims = (
        f"The other party (identified as '{d.suspected_person_or_entity or 'Unknown Actor'}', "
        f"contact '{d.suspected_phone or d.suspected_vpa or 'N/A'}') claimed that a payment "
        f"of {d.currency} {d.financial_loss_amount or 'stated sum'} was successfully executed via "
        f"{d.bank_or_upi_provider or 'UPI'} and presented a digital receipt as proof."
    )

    # Screenshot representation
    screenshot_obs = (
        f"The digital screenshot provided by the counterparty purportedly exhibits a transaction "
        f"with reference/UTR '{d.transaction_reference or 'Unconfirmed'}'. "
        f"Upon independent examination of my bank account balance, no corresponding deposit had occurred."
        if d.incident_category == "FAKE_PAYMENT_SCREENSHOT"
        else "A digital screenshot relating to this transaction was captured and preserved for technical analysis."
    )

    # Narrative synthesis
    chronological = f"""{t['sir_madam']}

{t['subject_prefix']} - {d.incident_category_label}

{t['personal_exp']}:
{personal_exp}

{t['counterparty_claims']}:
{counterparty_claims}

{t['screenshot_obs']}:
{screenshot_obs}

{t['forensic_obs']}:
{chr(10).join(forensic_obs)}

{t['requested_actions']}:
{t['action_freeze']}
{t['action_sec91']}
{t['action_investigate']}

Sincerely,
{d.complainant_name or 'Complainant'}
Contact: {d.complainant_contact or 'Provided with identity proof'}
Date: {datetime.now().strftime('%d %B %Y')}
"""

    financial_info = {
        "claimed_amount": d.financial_loss_amount or 0.0,
        "currency": d.currency,
        "financial_impact": d.financial_impact.value,
        "payment_method": d.payment_method or "UPI",
        "bank_or_psp": d.bank_or_upi_provider or "Unspecified",
    }

    suspected_info = {
        "name_or_alias": d.suspected_person_or_entity or "Unknown",
        "vpa": d.suspected_vpa or "N/A",
        "phone": d.suspected_phone or "N/A",
        "channel": d.communication_channel or "Digital Messaging",
    }

    evidence_docs = [
        "Annexure A: Original screenshot of the disputed payment / communication.",
        "Annexure B: Complainant-provided bank statement or provider record, if available; VeriSight has not independently verified it.",
        "Annexure C: Unedited messaging transcript (WhatsApp / Telegram / SMS).",
    ]
    if request.attached_forensic_report:
        evidence_docs.append("Annexure D: VeriSight Forensic Integrity Audit & Multi-Spectral Signal Report.")

    return FormalComplaint(
        id=comp_id,
        title=f"{t['title_prefix']} — {comp_id}",
        destination_authority_name=auth_name,
        destination_portal_url=auth_url,
        complainant_name=d.complainant_name or "Complainant",
        complainant_contact=d.complainant_contact or "Confidential / On File",
        incident_date_time=f"{d.incident_date or 'Recent'} {d.approximate_time or ''}".strip(),
        incident_category=d.incident_category_label,
        chronological_narrative=chronological.strip(),
        statements_breakdown={
            "personal_experience": personal_exp,
            "counterparty_claims": counterparty_claims,
            "screenshot_representation": screenshot_obs,
            "forensic_observations": "\n".join(forensic_obs),
            "unverified_elements": "Identity of counterparty and authenticity of remote server logs remain subject to law enforcement discovery.",
        },
        financial_details=financial_info,
        transaction_reference=d.transaction_reference or "NOT_SUPPLIED",
        suspected_entity=suspected_info,
        communication_channel=d.communication_channel or "Unspecified",
        evidence_inventory=d.available_evidence,
        forensic_observations=forensic_obs,
        requested_action=f"{t['action_freeze']} {t['action_sec91']} {t['action_investigate']}",
        supporting_document_index=evidence_docs,
        disclaimer=t["disclaimer_text"],
        language=lang,
    )
