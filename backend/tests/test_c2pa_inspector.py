from app.services.forensic.provenance.c2pa_inspector import inspect_c2pa_provenance


def test_c2pa_marker_is_never_misrepresented_as_cryptographically_verified():
    present, status, details = inspect_c2pa_provenance(b"jumbf c2pa C2PA_TEST_VALID")
    assert present is True
    assert status == "MANIFEST_PRESENT_UNVERIFIED"
    assert details["signature_valid"] is None
    assert details["validation_available"] is False


def test_absent_c2pa_marker_is_reported_as_absent():
    present, status, details = inspect_c2pa_provenance(b"ordinary screenshot bytes")
    assert present is False
    assert status == "NO_MANIFEST_FOUND"
    assert details["signature_valid"] is None
