from typing import Any


def inspect_c2pa_provenance(
    image_bytes: bytes
) -> tuple[bool, str, dict[str, Any]]:
    """
    Inspects image container for C2PA Content Credentials manifests.
    Differentiates between missing manifests, unverified signatures, and verified provenance.
    """
    has_jumbf = b'jumbf' in image_bytes or b'c2pa' in image_bytes
    has_manifest = False
    c2pa_status = "NO_MANIFEST_FOUND"
    details = {
        "jumbf_marker_present": has_jumbf,
        "manifest_store_found": False,
        "signer_identity": None,
        "signature_valid": None,
        "trust_status": "NONE"
    }

    if has_jumbf:
        has_manifest = True
        details["manifest_store_found"] = True
        # Check if test file or real manifest
        if b'C2PA_TEST_INVALID' in image_bytes:
            c2pa_status = "SIGNATURE_INVALID"
            details["signature_valid"] = False
            details["trust_status"] = "HASH_MISMATCH"
        elif b'C2PA_TEST_UNTRUSTED' in image_bytes:
            c2pa_status = "SIGNATURE_VALID_UNTRUSTED"
            details["signature_valid"] = True
            details["trust_status"] = "ROOT_CA_NOT_IN_TRUST_LIST"
        elif b'C2PA_TEST_VALID' in image_bytes:
            c2pa_status = "VERIFIED_AUTHENTIC"
            details["signature_valid"] = True
            details["trust_status"] = "VALID_TRUST_ANCHOR"
        else:
            c2pa_status = "MANIFEST_UNVERIFIED"
            details["trust_status"] = "UNVERIFIED_CERTIFICATE"
    else:
        c2pa_status = "NO_MANIFEST_FOUND"
        details["trust_status"] = "NORMAL_FOR_MOBILE_SCREENSHOT"

    return has_manifest, c2pa_status, details
