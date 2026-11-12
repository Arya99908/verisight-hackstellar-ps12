from app.services.forensic.intelligence.payment_entity_resolution import resolve_payment_entities


def test_qr_entity_resolution_marks_payload_values_unverified():
    result = resolve_payment_entities({
        "results": [{
            "kind": "UPI_PAYMENT_INTENT",
            "payee_vpa": "merchant@okaxis",
            "payee_name": "Example Merchant",
            "amount": "12.00",
            "currency": "INR",
            "reference": "demo-reference",
        }]
    })

    assert result["status"] == "QR_ENTITIES_EXTRACTED"
    assert result["entities"][0]["payee_vpa"] == "merchant@okaxis"
    assert "unverified" in result["entities"][0]["psp_hint"]
    assert result["syndicate_assessment"] == "NOT_AVAILABLE"
    assert result["payment_status"] == "NOT_CHECKED"


def test_no_qr_does_not_invent_payment_entities():
    result = resolve_payment_entities({"results": []})

    assert result["status"] == "NO_QR_PAYMENT_INTENT"
    assert result["entities"] == []
    assert result["payment_status"] == "NOT_CHECKED"
