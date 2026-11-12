"""Resolve only payment entities explicitly present in decoded QR payloads.

The current production pipeline does not run OCR, query payment providers, or
identify syndicates. This module keeps QR extraction separate and bounded.
"""
from __future__ import annotations

from typing import Any


_PSP_BY_HANDLE = {
    "ybl": "PhonePe handle (provider association unverified)",
    "axl": "PhonePe handle (provider association unverified)",
    "ibl": "PhonePe handle (provider association unverified)",
    "okaxis": "Google Pay handle (provider association unverified)",
    "okhdfcbank": "Google Pay handle (provider association unverified)",
    "okicici": "Google Pay handle (provider association unverified)",
    "oksbi": "Google Pay handle (provider association unverified)",
    "paytm": "Paytm handle (provider association unverified)",
}


def resolve_payment_entities(qr_details: dict[str, Any]) -> dict[str, Any]:
    """Return user-reviewable QR fields without asserting ownership or risk."""
    intents = [
        item for item in qr_details.get("results", [])
        if isinstance(item, dict) and item.get("kind") == "UPI_PAYMENT_INTENT"
    ]
    if not intents:
        return {
            "status": "NO_QR_PAYMENT_INTENT",
            "method": "QR payload parsing only; OCR is not enabled",
            "entities": [],
            "note": "No payment entity was resolved. Visible screenshot text is not OCR-extracted by this service.",
            "syndicate_assessment": "NOT_AVAILABLE",
            "payment_status": "NOT_CHECKED",
        }

    entities = []
    for item in intents:
        vpa = item.get("payee_vpa")
        handle = vpa.rsplit("@", 1)[-1].lower() if isinstance(vpa, str) and "@" in vpa else None
        entities.append({
            "payee_vpa": vpa,
            "payee_name": item.get("payee_name"),
            "amount": item.get("amount"),
            "currency": item.get("currency"),
            "reference": item.get("reference"),
            "psp_hint": _PSP_BY_HANDLE.get(handle, "Unknown handle; association not verified") if handle else None,
        })
    return {
        "status": "QR_ENTITIES_EXTRACTED",
        "method": "Decoded UPI QR payload; no OCR or external lookup",
        "entities": entities,
        "note": "QR fields are untrusted image content. Provider, payee ownership, syndicate links, and payment settlement are not verified.",
        "syndicate_assessment": "NOT_AVAILABLE",
        "payment_status": "NOT_CHECKED",
    }
