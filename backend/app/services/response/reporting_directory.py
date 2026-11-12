from app.services.response.models import ReportingAuthority

REPORTING_DIRECTORY: list[ReportingAuthority] = [
    ReportingAuthority(
        id="ncrp-1930",
        name="National Cyber Crime Reporting Portal (NCRP) & 1930 Helpline",
        category="NATIONAL_PORTAL",
        jurisdiction="All India (Ministry of Home Affairs & I4C)",
        type_of_complaint="Financial Cyber Fraud, Identity Theft, Forged Documents, Social Engineering",
        official_website="https://cybercrime.gov.in/",
        contact_information={
            "helpline": "1930 (National Cyber Crime Helpline)",
            "citizen_portal": "https://cybercrime.gov.in",
        },
        required_documents=[
            "Follow the information and evidence requirements shown by the official portal for your report type.",
            "Relevant transaction records or screenshots, if available; redact unrelated personal information where possible.",
        ],
        submission_procedure=[
            "For a recent financial cyber fraud, contact your bank or payment provider promptly and report through helpline 1930 or cybercrime.gov.in. Authorities and providers decide what action is available; reporting does not guarantee a freeze or recovery.",
            "Visit the official portal and follow its current reporting instructions.",
            "Provide only the information requested by the official portal or responding authority.",
            "Keep the acknowledgement or reference issued by the portal, if one is provided.",
        ],
        escalation_route="Follow instructions from the investigating authority and your bank/payment provider. Any recovery depends on the facts and actions available in the case.",
        waiting_period_days=0,
        prerequisites=[],
        last_verified_date="2026-11-13",
        source_reference="National Cyber Crime Reporting Portal, Government of India: https://cybercrime.gov.in/",
        disclaimer="VeriSight is an independent forensic platform and is not affiliated with MHA, I4C, or state police departments.",
    ),
    ReportingAuthority(
        id="bank-upi-psp",
        name="Bank Grievance Redressal & UPI Payment Service Providers (PSP)",
        category="BANK_UPI",
        jurisdiction="Applicable Bank / PSP Entity in India",
        type_of_complaint="Unauthorized Debit, Fake UPI Collect Request, Phishing Transfer, UPI Reversal Request",
        official_website="https://www.npci.org.in/what-we-do/upi/dispute-redressal-mechanism",
        contact_information={
            "google_pay_support": "1800-419-0157",
            "phonepe_support": "080-68727374 / 022-68727374",
            "paytm_cyber_fraud": "0120-3888388",
            "bhim_toll_free": "1800-120-1740",
            "sbi_cyber_tollfree": "1800-11-1109 / 1930",
            "hdfc_fraud_helpline": "1800-202-6161",
            "icici_fraud_helpline": "1800-1080",
            "axis_bank_emergency": "1800-419-5577",
            "npci_dispute_portal": "https://www.npci.org.in/what-we-do/upi/dispute-redressal-mechanism",
        },
        required_documents=[
            "12-digit UPI Transaction ID (UTR)",
            "Debit SMS timestamp and amount",
            "Virtual Payment Address (VPA) of payer and payee",
            "Complaint copy or FIR acknowledgement from 1930 / cybercrime portal",
        ],
        submission_procedure=[
            "Step 1: Immediately block the compromised debit card, UPI PIN, or NetBanking access via mobile app or emergency toll-free helpline.",
            "Step 2: Raise an in-app dispute inside your UPI app (Google Pay / PhonePe / Paytm / BHIM) under 'Payment Issues' -> 'Report Fraud / Unauthorized Payment'.",
            "Step 3: Call your bank's 24x7 cyber fraud cell within 3 days (72 hours) to qualify for zero-liability under RBI circular on unauthorized electronic banking transactions.",
            "Step 4: Request the bank to issue a Dispute Docket Number / Chargeback Reference Number.",
            "Step 5: If the transaction remains unresolved after 30 days, escalate to the RBI Banking Ombudsman.",
        ],
        escalation_route="Branch Manager -> Principal Nodal Officer (PNO) of the Bank -> RBI Ombudsman via CMS.",
        waiting_period_days=30,
        prerequisites=[
            "Must report within 72 hours of transaction for maximum zero-liability protection under RBI guidelines."
        ],
        last_verified_date="2026-10-25",
        source_reference="Reserve Bank of India (RBI) Circular DBR.No.Leg.BC.78/09.07.005/2017-18 'Customer Protection - Limiting Liability of Customers in Unauthorized Electronic Banking Transactions' & NPCI UPI Procedural Guidelines.",
        disclaimer="VeriSight is an independent forensic advisory platform and does not issue chargebacks or initiate bank reversals directly.",
    ),
    ReportingAuthority(
        id="rbi-cms-ombudsman",
        name="RBI Complaint Management System (CMS) — Banking Ombudsman",
        category="REGULATOR_RBI",
        jurisdiction="All Commercial, Cooperative, Small Finance Banks, NBFCs & Payment System Operators in India",
        type_of_complaint="Deficiency in Banking Service, Non-reversal of Failed UPI Transaction, Delay in Fraud Investigation, Breach of RBI Zero-Liability Guidelines",
        official_website="https://cms.rbi.org.in/",
        contact_information={
            "toll_free_crpc": "14448 (Centralised Receipt and Processing Centre, 9:30 AM to 5:15 PM)",
            "online_portal": "https://cms.rbi.org.in",
            "email": "crpc@rbi.org.in",
            "postal_address": "Centralised Receipt and Processing Centre (CRPC), Reserve Bank of India, 4th Floor, Sector 17, Chandigarh - 160017",
        },
        required_documents=[
            "Original written complaint submitted to the bank/PSP",
            "Bank's reply or copy of email/letter acknowledging the complaint",
            "Unique Complaint Tracking / Docket number issued by bank",
            "Proof that 30 calendar days have elapsed since initial complaint to the bank, OR copy of bank's final rejection letter",
            "Bank statement showing the disputed debit",
            "VeriSight Forensic Technical Report / Chain-of-Custody record",
        ],
        submission_procedure=[
            "Step 1: Confirm eligibility: You must first submit a written complaint to the regulated financial entity (Bank, NBFC, PPI issuer) and wait 30 days, or receive an unsatisfactory response.",
            "Step 2: Visit https://cms.rbi.org.in and select 'File a Complaint'.",
            "Step 3: Select the Regulated Entity (e.g. State Bank of India, Google India Digital Services, PhonePe, Paytm Payments Bank).",
            "Step 4: Enter complainant identity, account number, date of initial complaint to bank, and grievance category ('Electronic Banking / Fraud / Deficiency in Service').",
            "Step 5: Upload the initial bank complaint, rejection letter, and supporting evidence dossier.",
            "Step 6: Submit and receive a CMS Reference Number (e.g. CMS/2026/.../...).",
        ],
        escalation_route="RBI Ombudsman Award -> Appellate Authority (Executive Director in-charge of Consumer Education and Protection Department, RBI).",
        waiting_period_days=30,
        prerequisites=[
            "Mandatory 30-day waiting period after filing complaint with the bank, unless the bank rejects the complaint earlier.",
            "The complaint must not be sub-judice before any court, tribunal, or arbitrator.",
        ],
        last_verified_date="2026-10-15",
        source_reference="Reserve Bank - Integrated Ombudsman Scheme, 2021 (RB-IOS, 2021) amended up to 2026.",
        disclaimer="VeriSight is not affiliated with the Reserve Bank of India or the Office of the Banking Ombudsman.",
    ),
    ReportingAuthority(
        id="police-cyber-cell",
        name="State Cyber Crime Police Stations & Local Police",
        category="POLICE",
        jurisdiction="State Police Departments & Commissionerates (Across India)",
        type_of_complaint="Cyber Extortion, Impersonation, Fake Document Forgery (Section 336/338 BNS), Cheating (Section 318 BNS), Online Financial Fraud",
        official_website="https://cybercrime.gov.in/",
        contact_information={
            "national_emergency": "112",
            "cyber_helpline": "1930",
            "legal_provision": "Contact the relevant state or local police authority for current procedures.",
        },
        required_documents=[
            "Formal written complaint addressed to Station House Officer (SHO) or Cyber Crime Inspector",
            "Printed VeriSight Forensic Risk Dossier with SHA-256 hash & tamper analysis",
            "Printout of fake receipt / chat messages with date and sender metadata",
            "Complainant identity proof and address proof",
            "Bank statement showing loss or dispute",
        ],
        submission_procedure=[
            "Step 1: Draft formal written complaint using the VeriSight Complaint Builder.",
            "Step 2: Visit nearest police station or District Cyber Crime Police Station.",
            "If you need help with jurisdiction or escalation, contact the relevant state police authority or qualified legal counsel.",
            "Step 4: Submit two copies of the signed complaint with evidence annexures.",
            "Step 5: Obtain stamped acknowledgement with General Diary (GD) number or FIR number.",
        ],
        escalation_route="Use the current escalation path published by the relevant state police authority or seek qualified legal guidance.",
        waiting_period_days=0,
        prerequisites=[
            "Detailed factual narrative without speculation.",
            "Clear chronological timeline and counterparty identifiers.",
        ],
        last_verified_date="2026-10-20",
        source_reference="Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023, Bharatiya Nyaya Sanhita (BNS) 2023, and Bureau of Police Research and Development (BPR&D) SOPs.",
        disclaimer="VeriSight provides technical forensic analysis and does not constitute a law enforcement entity.",
    ),
    ReportingAuthority(
        id="platform-marketplace-abuse",
        name="Platform Abuse & Impersonation Reporting (WhatsApp, Telegram, OLX, Meta)",
        category="PLATFORM",
        jurisdiction="Digital Platform Service Providers",
        type_of_complaint="Account Impersonation, Marketplace Fraud, Fake Seller / Buyer Profiles, Phishing Distribution",
        official_website="https://www.whatsapp.com/safety/",
        contact_information={
            "whatsapp_grievance": "grievance_officer_wa@support.whatsapp.com",
            "telegram_anti_scam": "@notoscam (Telegram Bot) / abuse@telegram.org",
            "olx_safety": "support@olx.in / 1800-103-3333",
            "instagram_meta_report": "https://help.instagram.com/contact/383679321740945",
            "facebook_meta_grievance": "grievance-officer-india@support.facebook.com",
        },
        required_documents=[
            "Profile link, username, or phone number of the impersonator/fraudster",
            "Uncropped screenshots of chat conversations",
            "Screenshots of fraudulent QR codes or payment links shared",
            "Transaction reference if a transfer was attempted",
        ],
        submission_procedure=[
            "Step 1: Inside the app, tap the user or group header -> 'Report' -> 'Report Fraud / Impersonation'.",
            "Step 2: Take full-screen screenshots including timestamp and phone number/handle before blocking.",
            "Step 3: Send an email to the India Grievance Officer of the platform under Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.",
            "If needed, ask the relevant authority how to preserve records and follow the applicable legal process.",
        ],
        escalation_route="Intermediary Grievance Appellate Committee (GAC) at https://gac.gov.in/.",
        waiting_period_days=15,
        prerequisites=[
            "Accurate profile handle, phone number, or URL of suspect account"
        ],
        last_verified_date="2026-10-30",
        source_reference="Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 & Grievance Appellate Committee guidelines.",
        disclaimer="Platform reporting does not freeze bank accounts; always contact 1930 / bank if money was lost.",
    ),
]


def get_reporting_directory(
    query: str | None = None, category: str | None = None
) -> list[ReportingAuthority]:
    results = REPORTING_DIRECTORY
    if category and category.upper() != "ALL":
        results = [a for a in results if a.category == category.upper()]
    if query:
        q = query.strip().lower()
        results = [
            a
            for a in results
            if q in a.name.lower()
            or q in a.type_of_complaint.lower()
            or q in a.jurisdiction.lower()
            or any(q in k.lower() or q in v.lower() for k, v in a.contact_information.items())
        ]
    return results


def get_authority_by_id(authority_id: str) -> ReportingAuthority | None:
    for a in REPORTING_DIRECTORY:
        if a.id == authority_id:
            return a
    return None
