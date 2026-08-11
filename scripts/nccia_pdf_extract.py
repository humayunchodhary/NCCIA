#!/usr/bin/env python3
"""Extract NCCIA/FIA verification report fields from complaint PDFs."""

from __future__ import annotations

import io
import json
import re
import sys
from pathlib import Path


def normalize_cnic(raw: str | None) -> str | None:
    if not raw:
        return None
    digits = re.sub(r"\D", "", raw)
    if len(digits) != 13:
        return raw.strip() or None
    return f"{digits[:5]}-{digits[5:12]}-{digits[12]}"


def parse_date(raw: str | None) -> str | None:
    if not raw:
        return None
    raw = raw.strip()
    for fmt in ("%d-%m-%Y", "%d/%m/%Y", "%Y-%m-%d", "%d-%m-%y", "%d/%m/%y"):
        try:
            from datetime import datetime

            return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def inquiry_ref_from_filename(filename: str) -> str | None:
    stem = Path(filename).stem
    m = re.match(r"^(\d+)-(\d+)$", stem)
    if m:
        return f"E/{m.group(1)}/{m.group(2)}"
    m = re.match(r"^E[/\-]?(\d+)[/\-](\d+)$", stem, re.I)
    if m:
        return f"E/{m.group(1)}/{m.group(2)}"
    return None


def clean_value(val: str | None) -> str | None:
    if not val:
        return None
    val = val.strip().strip('"').strip("'")
    val = re.sub(r"\s+", " ", val)
    return val or None


def first_match(text: str, patterns: list[str], flags: int = re.I | re.S) -> str | None:
    for pattern in patterns:
        m = re.search(pattern, text, flags)
        if m:
            val = m.group(1).strip()
            val = re.sub(r"\s+", " ", val)
            if val:
                return val
    return None


def ocr_page(page) -> str:
    import fitz

    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    png_bytes = pix.tobytes("png")

    try:
        import pytesseract
        from PIL import Image

        img = Image.open(io.BytesIO(png_bytes))
        text = pytesseract.image_to_string(img)
        if len(text.strip()) > 40:
            return text
    except Exception:
        pass

    try:
        import tempfile
        import easyocr

        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp.write(png_bytes)
            tmp_path = tmp.name

        if not hasattr(ocr_page, "_reader"):
            ocr_page._reader = easyocr.Reader(["en"], gpu=False, verbose=False)  # type: ignore[attr-defined]

        lines = ocr_page._reader.readtext(tmp_path, detail=0)  # type: ignore[attr-defined]
        Path(tmp_path).unlink(missing_ok=True)
        return "\n".join(lines)
    except Exception:
        return ""


def extract_text_from_pdf(pdf_path: str, max_pages: int = 1) -> tuple[str, int, bool]:
    import fitz

    doc = fitz.open(pdf_path)
    page_count = doc.page_count
    chunks: list[str] = []
    used_ocr = False

    for i in range(min(max_pages, page_count)):
        page = doc[i]
        text = page.get_text("text") or ""
        if len(text.strip()) < 40:
            ocr_text = ocr_page(page)
            if ocr_text.strip():
                text = ocr_text
                used_ocr = True
        chunks.append(text)

    doc.close()
    return "\n".join(chunks), page_count, used_ocr


def split_name_father(full_name: str | None) -> tuple[str | None, str | None]:
    if not full_name:
        return None, None
    m = re.match(r"^(.+?)\s+S/O\s+(.+)$", full_name, re.I)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    m = re.match(r"^(.+?)\s+D/O\s+(.+)$", full_name, re.I)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return full_name.strip(), None


def map_recommendation(text: str | None) -> str | None:
    if not text:
        return None
    lower = text.lower()
    if "register enq" in lower or "registration of enquiry" in lower:
        return "enquiry_registration"
    if "closure" in lower or "close" in lower:
        return "closure"
    if "merge" in lower:
        return "merge"
    if "transfer" in lower:
        return "transfer"
    return None


def parse_verification_report(text: str, filename: str) -> dict:
    tracking_no = first_match(
        text,
        [
            r"Tracking\s*No\.?\s*:?\s*([A-Z0-9][A-Z0-9\-\/]+)",
            r"Tracking\s*Number\s*:?\s*([A-Z0-9][A-Z0-9\-\/]+)",
            r"VERIFICATION\s*REPORT\s*[\n\r]+No\.?\s*([A-Z0-9][A-Z0-9\-\/]+)",
            r"No\.?\s*(CCW-[A-Z0-9\-\/]+)",
        ],
    )

    verification_date = parse_date(
        first_match(text, [r"Verification\s*Date\s*:?\s*([\d\-\/]+)"])
    )
    assignment_date = parse_date(
        first_match(text, [r"Assignment\s*Date\s*:?\s*([\d\-\/]+)"])
    )

    full_name = first_match(
        text,
        [
            r"COMPLAINANT\s*DETAILS.*?Name\.?\s*:?\s*(.+?)(?:Gender|CNIC|$)",
            r"Name\.?\s*:?\s*(.+?)(?:Gender|CNIC|$)",
            r"Name\s*:?\s*(.+?)\s+Gender\s*:",
        ],
    )
    victim_name, victim_father_name = split_name_father(full_name)

    gender_raw = first_match(text, [r"Gender\s*:?\s*(Male|Female|Other)", r"Gender\s*:?\s*(\w+)"])
    victim_gender = gender_raw.lower() if gender_raw else None
    if not victim_gender and re.search(r"\bMale\b", text, re.I):
        victim_gender = "male"
    elif not victim_gender and re.search(r"\bFemale\b", text, re.I):
        victim_gender = "female"

    city = clean_value(city)
    address = clean_value(address)
    crime_category = clean_value(crime_category)
    crime_description = clean_value(crime_description)
    victim_occupation = clean_value(victim_occupation)
    if recommendation_text and len(recommendation_text) > 200:
        recommendation_text = recommendation_text[:200] + "…"

    cnic_raw = first_match(
        text,
        [r"CNIC\s*No\.?\s*:?\s*([\d\-]+)", r"CNIC\s*No\.?\s*([\d]+)", r"CNIC\s*:?\s*([\d\-]+)"],
    )
    victim_cnic = normalize_cnic(cnic_raw)

    victim_occupation = first_match(
        text,
        [r"Occupation\s*:?\s*(.+?)(?:Contact|Mobile|Address|$)", r"Occupation\s*:?\s*(.+?)(?:\n|$)"],
    )

    victim_phone = first_match(
        text,
        [
            r"Mobile\s*Number\s*:?\s*([\d\-]+)",
            r"Details\.?\s*Mobile\s*Number\s*:?\s*([\d\-]+)",
            r"Contact\s*Details\s*:?\s*([\d\-]+)",
        ],
    )
    if victim_phone:
        victim_phone = re.sub(r"\D", "", victim_phone)
        if victim_phone.startswith("92") and len(victim_phone) > 10:
            victim_phone = victim_phone[2:]
        if len(victim_phone) == 10:
            victim_phone = "0" + victim_phone

    address = first_match(
        text,
        [
            r"Current\s*Address\s*:?\s*(.+?)(?:BRIEF|Brief|RECOMMEND|Online|$)",
            r"Addresses\s*Current\s*Address\s*:?\s*(.+?)(?:BRIEF|Brief|Online|$)",
        ],
    )

    crime_category = first_match(
        text,
        [
            r"BRIEF\s*DESCRIPTION.*?[\n\r]+(.+?)(?:accuse|Accuse|During|Online|$)",
            r"Online\s+Job\s+Frauds",
        ],
    )

    crime_description = first_match(
        text,
        [
            r"(accuse[d]?\s+defrauded.+?)(?:City|Amount|0f Occurrence|RECOMMEND|$)",
            r"(accuse.+?investment.+?)(?:City|Amount|RECOMMEND|$)",
        ],
    )

    city = first_match(
        text,
        [
            r"City\s*of\s*Occurrence\s*:?\s*(.+?)(?:Complaint|Amount|RECOMMEND|$)",
            r"0f\s*Occurrence\s*(.+?)(?:working|Amount|RECOMMEND|$)",
        ],
    )

    amount_raw = first_match(
        text,
        [
            r"Amount\s*Involved\.?\s*:?\s*([\d,\.]+)",
            r"Amount\s*Involved\s*:?\s*([\d,\.]+)",
            r"Rs\.?\s*([\d,\.]+)",
        ],
    )
    amount_involved = None
    if amount_raw:
        try:
            amount_involved = float(re.sub(r"[^\d.]", "", amount_raw))
        except ValueError:
            amount_involved = None

    recommendation_text = first_match(
        text,
        [
            r"RECOMMENDATIONS?\s*:?\s*(.+?)(?:Justification|Reporting Officer|$)",
            r"Per(?:m|i)ssion\s+to\s+Register\s+Enq(?:u|ui)ry",
        ],
    )
    recommendation = map_recommendation(recommendation_text or text)

    recommendation_full = first_match(
        text,
        [r"Justification\s*:?\s*(.+?)(?:Reporting Officer|Assistant Sub|$)"],
    )

    inquiry_no = first_match(
        text,
        [r"E[/\-]\s*(\d+)\s*[/\-]\s*(\d+)", r"Inquiry\s*No\.?\s*:?\s*([A-Z0-9/\-]+)"],
    )
    if inquiry_no and not inquiry_no.startswith("E"):
        m = re.match(r"(\d+)\s*[/\-]\s*(\d+)", inquiry_no)
        if m:
            inquiry_no = f"E/{m.group(1)}/{m.group(2)}"
    if not inquiry_no:
        inquiry_no = inquiry_ref_from_filename(filename)

    confidence = 0
    for val in [tracking_no, victim_name, victim_cnic, victim_phone, crime_category, city]:
        if val:
            confidence += 1

    return {
        "document_type": "verification_report",
        "tracking_no": tracking_no,
        "verification_date": verification_date,
        "assignment_date": assignment_date,
        "victim_name": victim_name,
        "victim_father_name": victim_father_name,
        "victim_gender": victim_gender,
        "victim_cnic": victim_cnic,
        "victim_occupation": victim_occupation,
        "victim_phone": victim_phone,
        "victim_address": address,
        "crime_category": crime_category,
        "crime_description": crime_description,
        "city": city,
        "amount_involved": amount_involved,
        "recommendation": recommendation,
        "recommendation_short": recommendation_text,
        "recommendation_full": recommendation_full,
        "inquiry_no": inquiry_no,
        "confidence_score": confidence,
        "raw_text_preview": re.sub(r"\s+", " ", text)[:2000],
    }


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: nccia_pdf_extract.py <pdf_path>"}))
        return 1

    pdf_path = sys.argv[1]
    filename = Path(pdf_path).name

    try:
        text, page_count, used_ocr = extract_text_from_pdf(pdf_path)
        parsed = parse_verification_report(text, filename)
        parsed["page_count"] = page_count
        parsed["used_ocr"] = used_ocr
        parsed["source_filename"] = filename
        print(json.dumps(parsed, ensure_ascii=False))
        return 0
    except Exception as exc:
        print(json.dumps({"error": str(exc), "source_filename": filename}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
