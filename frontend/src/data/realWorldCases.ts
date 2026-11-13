import { IncidentCategory } from "../types/response";

export interface PublicFraudAdvisory {
  id: string;
  headline: string;
  shortHeadline?: string;
  sourceScope: string;
  sourceDate: string;
  displayContext: string;
  scamCategory: string;
  categoryCode: IncidentCategory;
  summary: string;
  modusOperandi: string[];
  warningSigns: string[];
  preventionInsight: string;
  verisightRelevance: {
    forensicLayer: string;
    examination: string;
    userGuidance: string;
    responseFeature: string;
  };
  publisher: string;
  sourceUrl: string;
  imageUrl: string;
  imageAlt: string;
  illustrationType: "digital-arrest" | "ipo-forgery" | "fake-gpay" | "reverse-qr" | "marketplace" | "soundbox" | "double-debit";
  accentColor: string;
}

export const PUBLIC_FRAUD_ADVISORIES: PublicFraudAdvisory[] = [
  {
    id: "advisory-delhi-olx-qr",
    headline: "Delhi Police: Fake payment screenshots and QR-code traps",
    shortHeadline: "Fake payment screenshots and QR traps",
    sourceScope: "Delhi Police public guidance",
    sourceDate: "Date not listed on source page",
    displayContext: "FAKE SCREENSHOT + QR",
    scamCategory: "Marketplace payment and QR safety",
    categoryCode: "FAKE_PAYMENT_SCREENSHOT",
    summary:
      "Delhi Police describes an OLX/Quikr pattern in which a supposed buyer sends a fake payment screenshot, then asks the seller to scan a QR code. The advisory warns that this can result in money being debited rather than credited. It is general safety guidance, not a case report with a stated loss.",
    modusOperandi: [
      "A person posing as a buyer contacts someone selling an item online.",
      "The person sends a screenshot that purports to show a completed payment.",
      "If the seller says no money arrived, the person may send a QR code and direct the seller through a payment flow.",
      "The police advisory warns that following the QR flow can debit money from the seller's account.",
    ],
    warningSigns: [
      "A screenshot is offered as proof before the credit appears in your own bank or payment account.",
      "A buyer creates urgency or asks you to scan a code to receive money.",
      "An app asks for a UPI PIN or payment authorization when you expect to receive funds.",
    ],
    preventionInsight:
      "Verify the credit in your own bank or payment account. Do not enter a UPI PIN to receive money or rely on a screenshot alone.",
    verisightRelevance: {
      forensicLayer: "Heuristic image review and QR payload parsing",
      examination:
        "VeriSight can show heuristic image cues and may decode readable QR content. It does not authenticate the screenshot, verify the recipient, or check settlement.",
      userGuidance:
        "Confirm incoming funds in your own bank or payment-provider transaction history before handing over goods.",
      responseFeature:
        "The prototype can prepare an editable evidence summary and incident draft. It does not submit a complaint, freeze funds, or issue legal notices.",
    },
    publisher: "Delhi Police Cyber Crime Unit",
    sourceUrl: "https://cyber.delhipolice.gov.in/OLX.html",
    imageUrl: "/images/cases/delhi-upi-phone.jpg",
    imageAlt: "Illustration of a phone and payment screen; not evidence from a reported incident.",
    illustrationType: "fake-gpay",
    accentColor: "#ef4444",
  },
  {
    id: "advisory-delhi-kyc",
    headline: "Delhi Police: Fake customer-care and app-KYC warnings",
    shortHeadline: "Fake support numbers and remote-access apps",
    sourceScope: "Delhi Police public guidance",
    sourceDate: "Date not listed on source page",
    displayContext: "FAKE SUPPORT / KYC",
    scamCategory: "Customer-care and app-KYC safety",
    categoryCode: "PHISHING_SOCIAL_ENGINEERING",
    summary:
      "Delhi Police warns about fake customer-care numbers and unsolicited support contacts. Its guidance cautions against installing remote-viewing apps at a caller's request and warns users to be careful with QR codes presented as a way to receive money. The page does not report a single victim or loss amount.",
    modusOperandi: [
      "A caller or search result may present a number as customer support for a bank or payment service.",
      "The person may ask the user to install a remote-viewing application or share sensitive information.",
      "A QR code may be described as a way to receive payment even though the payment screen could authorize an outgoing transaction.",
    ],
    warningSigns: [
      "Unsolicited support calls, links, or requests for card details, OTPs, or remote access.",
      "Instructions to install a remote-control app to resolve a payment or KYC issue.",
      "A QR scan or PIN prompt framed as necessary to receive money.",
    ],
    preventionInsight:
      "Use contact details from the provider's official app or website. Do not share OTPs or install remote-access tools at a caller's request.",
    verisightRelevance: {
      forensicLayer: "Separate screenshot and QR review cues",
      examination:
        "The analyzer does not identify a caller or app from a screenshot. A decoded QR payload is untrusted text and is not checked against the payment provider.",
      userGuidance:
        "Contact the bank or payment service through a channel you independently know to be official.",
      responseFeature:
        "Response & Guidance can turn a user-reviewed narrative into an editable draft; it cannot contact the provider or file the report for you.",
    },
    publisher: "Delhi Police Cyber Crime Unit",
    sourceUrl: "https://cyber.delhipolice.gov.in/Appkyc.html",
    imageUrl: "/images/cases/mumbai-payment-app.jpg",
    imageAlt: "Illustration of a mobile payment screen; not evidence from a reported incident.",
    illustrationType: "marketplace",
    accentColor: "#38bdf8",
  },
  {
    id: "advisory-i4c-qr-tampering",
    headline: "I4C advisory listing: QR-code tampering",
    shortHeadline: "QR-code tampering advisory",
    sourceScope: "National I4C advisory index",
    sourceDate: "April 26, 2022",
    displayContext: "QR CODE SAFETY",
    scamCategory: "QR-code safety advisory",
    categoryCode: "QR_CODE_FRAUD",
    summary:
      "The Indian Cyber Crime Coordination Centre's advisory index lists an advisory titled “Cybercriminals Tampering with QR Codes to defraud Citizens,” dated April 26, 2022. The index is a source listing, not a case record; it does not provide an incident count or loss figure on that page.",
    modusOperandi: [
      "The I4C index flags QR-code tampering as a cybercrime topic for public awareness.",
      "The linked index does not document a named victim, transaction, or case-specific amount.",
    ],
    warningSigns: [
      "A QR code arrives unexpectedly or is attached to a payment or login instruction.",
      "The destination, payee, or requested action differs from what you expected.",
      "A QR scan opens a link or payment prompt that you did not intend to use.",
    ],
    preventionInsight:
      "Check the destination and payee shown by the official app before continuing. Stop if the requested action differs from your intent.",
    verisightRelevance: {
      forensicLayer: "QR decoding only when a code is readable",
      examination:
        "VeriSight may display a decoded payload. It does not test whether a QR image was replaced, determine whether a link is safe, or verify payee ownership.",
      userGuidance:
        "Do not treat a visual scan result as a safety verdict. Verify the payee and action in your trusted payment app.",
      responseFeature:
        "The product can preserve a review summary for a human to use in a report draft; it does not block a code or file a complaint.",
    },
    publisher: "Indian Cyber Crime Coordination Centre (I4C)",
    sourceUrl: "https://cybercrime.gov.in/Webform/Advisory.aspx",
    imageUrl: "/images/cases/bengaluru-qr-scan.jpg",
    imageAlt: "Illustration of a QR code being scanned; not evidence from a reported incident.",
    illustrationType: "reverse-qr",
    accentColor: "#10b981",
  },
  {
    id: "advisory-i4c-army-impersonation",
    headline: "I4C advisory listing: Misuse of Army personnel details",
    shortHeadline: "Impersonation and payment-screenshot warnings",
    sourceScope: "National I4C advisory index",
    sourceDate: "July 6, 2022",
    displayContext: "IMPERSONATION RISK",
    scamCategory: "Impersonation and payment safety",
    categoryCode: "IMPERSONATION",
    summary:
      "The I4C advisory index lists a notice titled “Fraudsters using Army personnel details to perpetrate financial cyber frauds,” dated July 6, 2022. Delhi Police separately describes fake payment screenshots in marketplace interactions. These advisories describe risk patterns, not one verified incident or loss total.",
    modusOperandi: [
      "The I4C index identifies misuse of Army personnel details as a financial-cyber-fraud topic.",
      "Delhi Police guidance describes marketplace approaches that may include a fake payment screenshot and a QR-code request.",
      "The advisory pages do not establish any particular person's identity or describe a single case total.",
    ],
    warningSigns: [
      "A claimed identity or uniform is used to create trust or urgency.",
      "The other person asks you to accept a screenshot instead of checking your own account.",
      "You are asked to scan a code, enter a PIN, or send money to receive funds.",
    ],
    preventionInsight:
      "Independently verify the counterparty and confirm payment in your own account before releasing goods or sharing sensitive information.",
    verisightRelevance: {
      forensicLayer: "Heuristic visual review; no identity lookup",
      examination:
        "The image analyzer cannot determine who created or displayed an image and does not verify military, bank, or government identity claims.",
      userGuidance:
        "Use a separate trusted channel to verify identity and payment status. A screenshot does not establish either.",
      responseFeature:
        "VeriSight offers editable notes and report drafts only. It does not perform identity checks, investigation, or legal process.",
    },
    publisher: "Indian Cyber Crime Coordination Centre (I4C)",
    sourceUrl: "https://cybercrime.gov.in/Webform/Advisory.aspx",
    imageUrl: "/images/cases/bengaluru-digital-arrest.jpg",
    imageAlt: "Illustration of a suspicious mobile interaction; not evidence from a reported incident.",
    illustrationType: "digital-arrest",
    accentColor: "#f59e0b",
  },
  {
    id: "guide-i4c-upi-safety",
    headline: "I4C safety manual: Verify the payee and protect your UPI PIN",
    shortHeadline: "UPI safety basics",
    sourceScope: "National cyber-safety guidance",
    sourceDate: "Date not confirmed in the cited excerpt",
    displayContext: "UPI SAFETY BASICS",
    scamCategory: "UPI transaction safety",
    categoryCode: "UPI_FRAUD",
    summary:
      "The Government of India's cybercrime safety manual advises users to verify the payee or QR code before proceeding and states that a UPI PIN is not needed to receive money. This is general safety guidance, not a reported fraud case.",
    modusOperandi: [
      "The manual directs users to verify the payee or QR code before authorizing a transaction.",
      "It cautions users not to share a UPI PIN and explains that a PIN is not required to receive payments.",
    ],
    warningSigns: [
      "A supposed incoming payment requires you to enter a UPI PIN.",
      "The displayed payee or transaction amount differs from your intent.",
      "Someone pressures you to approve a payment immediately.",
    ],
    preventionInsight:
      "Read the payee and amount shown in your trusted app, and never share a UPI PIN. A PIN authorizes a transaction; it is not needed to receive money.",
    verisightRelevance: {
      forensicLayer: "Visual and QR cues remain separate from transaction verification",
      examination:
        "A screenshot can show text or a QR payload, but VeriSight does not query the bank or establish that a payment settled.",
      userGuidance:
        "Check the status in your own bank or payment-provider app, and review the payee and amount before approving a payment.",
      responseFeature:
        "The response tools prepare user-editable drafts and safety guidance; they do not reverse or freeze transactions.",
    },
    publisher: "Indian Cyber Crime Coordination Centre (I4C)",
    sourceUrl: "https://cybercrime.gov.in/pdf/Final_English_Manual_Basic.pdf",
    imageUrl: "/images/cases/hyderabad-qr-terminal.jpg",
    imageAlt: "Illustration of a QR code and payment terminal; not evidence from a reported incident.",
    illustrationType: "reverse-qr",
    accentColor: "#10b981",
  },
  {
    id: "guide-ncrp-reporting",
    headline: "National Cyber Crime Portal: Reporting a financial cyber fraud",
    shortHeadline: "Where to report financial cyber fraud",
    sourceScope: "National reporting guidance",
    sourceDate: "Date not confirmed in the cited document",
    displayContext: "REPORTING GUIDANCE",
    scamCategory: "Financial cyber-fraud reporting",
    categoryCode: "PAYMENT_FRAUD",
    summary:
      "The National Cyber Crime Reporting Portal's citizen instructions tell victims to call 1930 or report online, and list transaction details and screenshots among information that may be needed. Police and financial institutions determine the action available; reporting does not guarantee recovery or a freeze.",
    modusOperandi: [
      "The official instructions describe how a victim can report a financial cyber-fraud incident.",
      "They request transaction and account information to help authorities and providers review the report.",
      "Any case action or recovery depends on the relevant authorities and financial institutions.",
    ],
    warningSigns: [
      "Someone offers guaranteed recovery or asks for an extra payment to recover funds.",
      "A person claiming to be support asks for your PIN, password, or OTP.",
      "A reporting helper asks you to send sensitive information through an unofficial contact channel.",
    ],
    preventionInsight:
      "If money may have been lost, contact your bank or payment provider promptly and use the official 1930 helpline or cybercrime.gov.in. Keep transaction records and evidence.",
    verisightRelevance: {
      forensicLayer: "Evidence summary and draft generation only",
      examination:
        "An exported screenshot review report records heuristic cues; it is not an official finding, a submitted complaint, or proof of settlement.",
      userGuidance:
        "Use the official portal or helpline and review every detail yourself before submitting information.",
      responseFeature:
        "The complaint builder creates an editable draft. The user must submit it through the official channel; VeriSight cannot promise a response or recovery.",
    },
    publisher: "National Cyber Crime Reporting Portal (I4C)",
    sourceUrl: "https://cybercrime.gov.in/uploadmedia/instructions_citizenreportingcyberfrauds.pdf",
    imageUrl: "/images/cases/pune-trading-voucher.jpg",
    imageAlt: "Illustration of a reporting document and mobile device; not a real complaint or case exhibit.",
    illustrationType: "ipo-forgery",
    accentColor: "#38bdf8",
  },
];
