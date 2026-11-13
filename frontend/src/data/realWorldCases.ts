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
  sourceUrl?: string | null;
  sourceKind: "POLICE_GUIDANCE" | "GOVERNMENT_ADVISORY" | "PAYMENT_SAFETY_GUIDANCE" | "REPORTING_GUIDANCE";
  sourceLinkLabel: string;
  sourceAccessNote?: string;
  imageUrl: string;
  imageAlt: string;
  illustrationType: "digital-arrest" | "ipo-forgery" | "fake-gpay" | "reverse-qr" | "marketplace" | "soundbox" | "double-debit";
  accentColor: string;
}

/** Accept only absolute HTTPS source links; invalid links are shown as unavailable. */
export const getSafeAdvisorySourceUrl = (sourceUrl?: string | null): string | null => {
  if (!sourceUrl) return null;
  try {
    const parsed = new URL(sourceUrl);
    if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch {
    return null;
  }
};

export const getAdvisorySourceKindLabel = (sourceKind: PublicFraudAdvisory["sourceKind"]): string => {
  switch (sourceKind) {
    case "POLICE_GUIDANCE": return "POLICE GUIDANCE";
    case "GOVERNMENT_ADVISORY": return "GOVERNMENT ADVISORY";
    case "PAYMENT_SAFETY_GUIDANCE": return "PAYMENT SAFETY GUIDE";
    case "REPORTING_GUIDANCE": return "REPORTING GUIDANCE";
  }
};

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
    sourceKind: "POLICE_GUIDANCE",
    sourceLinkLabel: "Read Delhi Police guidance",
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
    sourceKind: "POLICE_GUIDANCE",
    sourceLinkLabel: "Read Delhi Police guidance",
    imageUrl: "/images/cases/mumbai-payment-app.jpg",
    imageAlt: "Illustration of a mobile payment screen; not evidence from a reported incident.",
    illustrationType: "marketplace",
    accentColor: "#38bdf8",
  },
  {
    id: "advisory-i4c-qr-tampering",
    headline: "FBI IC3 advisory: Criminals tampering with QR codes to steal funds",
    shortHeadline: "QR-code tampering advisory",
    sourceScope: "FBI Internet Crime Complaint Center (IC3)",
    sourceDate: "January 18, 2022",
    displayContext: "QR CODE SAFETY",
    scamCategory: "QR-code safety advisory",
    categoryCode: "QR_CODE_FRAUD",
    summary:
      "The FBI's Internet Crime Complaint Center warns that criminals may use QR codes to direct people to malicious sites, install malware, or redirect payments. This is a public safety advisory about a risk pattern, not an India-specific incident or loss estimate.",
    modusOperandi: [
      "The advisory describes QR codes that lead to malicious websites or malware downloads.",
      "It also describes QR codes that redirect a payment to a criminal-controlled destination.",
    ],
    warningSigns: [
      "A QR code arrives unexpectedly or is attached to a payment or login instruction.",
      "The destination, payee, or requested action differs from what you expected.",
      "A QR scan opens a link or payment prompt that you did not intend to use.",
    ],
    preventionInsight:
      "Check the destination and payee shown by the official app before continuing. Stop if the requested action differs from your intent; these are general precautions, not a guarantee that a code is safe.",
    verisightRelevance: {
      forensicLayer: "QR decoding only when a code is readable",
      examination:
        "VeriSight may display a decoded payload. It does not test whether a QR image was replaced, determine whether a link is safe, or verify payee ownership.",
      userGuidance:
        "Do not treat a visual scan result as a safety verdict. Verify the payee and action in your trusted payment app.",
      responseFeature:
        "The product can preserve a review summary for a human to use in a report draft; it does not block a code or file a complaint.",
    },
    publisher: "FBI Internet Crime Complaint Center (IC3)",
    sourceUrl: "https://www.ic3.gov/PSA/2022/PSA220118",
    sourceKind: "GOVERNMENT_ADVISORY",
    sourceLinkLabel: "Read the original IC3 advisory",
    sourceAccessNote: "This FBI advisory is not India-specific and does not report a single named victim or case amount.",
    imageUrl: "/images/cases/bengaluru-qr-scan.jpg",
    imageAlt: "Illustration of a QR code being scanned; not evidence from a reported incident.",
    illustrationType: "reverse-qr",
    accentColor: "#10b981",
  },
  {
    id: "advisory-i4c-army-impersonation",
    headline: "West Bengal Cyber Crime Wing: Army-personnel impersonation warning",
    shortHeadline: "Army-personnel impersonation warning",
    sourceScope: "West Bengal Cyber Crime Wing advisory",
    sourceDate: "June 24, 2024 (advisory index)",
    displayContext: "IMPERSONATION RISK",
    scamCategory: "Impersonation and payment safety",
    categoryCode: "IMPERSONATION",
    summary:
      "West Bengal Cyber Crime Wing warns that fraudsters may use stolen or fake Army-personnel details to target people advertising rental properties. The advisory describes payment requests framed as money to receive, but it does not report one named victim or a case-specific loss amount.",
    modusOperandi: [
      "Fraudsters find rental listings and pose as Army personnel using stolen or false identity details.",
      "They may request UPI information or send a request for money while claiming that the owner will receive a payment.",
      "A victim who approves that request can send money instead of receiving it.",
    ],
    warningSigns: [
      "An unknown person claims to be military personnel while responding to a rental listing.",
      "The person creates urgency or asks you to share payment details before you can verify their identity.",
      "A payment request or OTP is described as a way to receive money.",
    ],
    preventionInsight:
      "Verify the counterparty through an independent channel. Review every payment request carefully; an OTP or UPI PIN authorizes an outgoing transaction, not receipt of funds.",
    verisightRelevance: {
      forensicLayer: "Heuristic visual review; no identity lookup",
      examination:
        "The image analyzer cannot determine who created or displayed an image and does not verify military, bank, or government identity claims.",
      userGuidance:
        "Use a separate trusted channel to verify identity and payment status. A screenshot does not establish either.",
      responseFeature:
        "VeriSight offers editable notes and report drafts only. It does not perform identity checks, investigation, or legal process.",
    },
    publisher: "West Bengal Cyber Crime Wing",
    sourceUrl: "https://cybercrimewing.wb.gov.in/FraudstersusingArmypersonneldetailstoperpetratefinancialcyberfrauds",
    sourceKind: "GOVERNMENT_ADVISORY",
    sourceLinkLabel: "Read the original police advisory",
    imageUrl: "/images/cases/bengaluru-digital-arrest.jpg",
    imageAlt: "Illustration of a suspicious mobile interaction; not evidence from a reported incident.",
    illustrationType: "digital-arrest",
    accentColor: "#f59e0b",
  },
  {
    id: "guide-i4c-upi-safety",
    headline: "RBI advice: QR codes, UPI collect requests and digital fraud",
    shortHeadline: "UPI safety basics",
    sourceScope: "Reserve Bank of India public guidance",
    sourceDate: "January 28, 2022",
    displayContext: "UPI SAFETY BASICS",
    scamCategory: "UPI transaction safety",
    categoryCode: "UPI_FRAUD",
    summary:
      "The Reserve Bank of India warns about unauthorized QR codes, fake UPI collect requests, and requests to enter a UPI PIN to receive money. Its safe-digital-banking guidance says receiving money does not require scanning a QR code or entering an MPIN. This is general safety guidance, not a reported fraud case.",
    modusOperandi: [
      "The RBI warns users about unauthorized QR codes and fraudulent UPI collect requests.",
      "Its guidance says receiving money does not require scanning a QR code or entering an MPIN.",
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
    publisher: "Reserve Bank of India (RBI)",
    sourceUrl: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=53185",
    sourceKind: "PAYMENT_SAFETY_GUIDANCE",
    sourceLinkLabel: "Read RBI public guidance",
    imageUrl: "/images/cases/hyderabad-qr-terminal.jpg",
    imageAlt: "Illustration of a QR code and payment terminal; not evidence from a reported incident.",
    illustrationType: "reverse-qr",
    accentColor: "#10b981",
  },
  {
    id: "guide-ncrp-reporting",
    headline: "I4C: National Cybercrime Reporting Portal and 1930 guidance",
    shortHeadline: "Where to report financial cyber fraud",
    sourceScope: "National reporting guidance",
    sourceDate: "I4C page updated March 11, 2026",
    displayContext: "REPORTING GUIDANCE",
    scamCategory: "Financial cyber-fraud reporting",
    categoryCode: "PAYMENT_FRAUD",
    summary:
      "I4C explains that its National Cybercrime Reporting Portal accepts reports for all types of cybercrime. Its overview says financial cyber fraud can be reported through the official portal or the 1930 helpline. Reporting does not guarantee that funds will be recovered or frozen.",
    modusOperandi: [
      "I4C's overview describes the National Cybercrime Reporting Portal as a place to report cybercrime incidents.",
      "For financial cyber fraud, I4C says the 1930 helpline supports quick reporting through the Citizen Financial Cyber Fraud Reporting and Management System.",
      "The police and financial institutions determine what action is available in an individual complaint.",
    ],
    warningSigns: [
      "Someone offers guaranteed recovery or asks for an extra payment to recover funds.",
      "A person claiming to be support asks for your PIN, password, or OTP.",
      "A reporting helper directs you to a non-government website instead of the official portal or helpline.",
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
    sourceUrl: "https://i4c.mha.gov.in/ncrp.aspx",
    sourceKind: "REPORTING_GUIDANCE",
    sourceLinkLabel: "Read I4C reporting guidance",
    imageUrl: "/images/cases/pune-trading-voucher.jpg",
    imageAlt: "Illustration of a reporting document and mobile device; not a real complaint or case exhibit.",
    illustrationType: "ipo-forgery",
    accentColor: "#38bdf8",
  },
];
