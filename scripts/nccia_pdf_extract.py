#!/usr/bin/env python3
"""Extract NCCIA/FIA verification report fields from complaint PDFs.

Compatible with Python 3.6+ (shared hosting).
"""

import io
import json
import os
import re
import sys
from pathlib import Path


def normalize_cnic(raw):
    if not raw:
        return None
    digits = re.sub(r"\D", "", raw)
    if len(digits) != 13:
        return raw.strip() or None
    return f"{digits[:5]}-{digits[5:12]}-{digits[12]}"


def parse_date(raw):
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


def inquiry_ref_from_filename(filename):
    stem = Path(filename).stem
    m = re.match(r"^(\d+)-(\d+)$", stem)
    if m:
        return f"E/{m.group(1)}/{m.group(2)}"
    m = re.match(r"^E[/\-]?(\d+)[/\-](\d+)$", stem, re.I)
    if m:
        return f"E/{m.group(1)}/{m.group(2)}"
    return None


def clean_value(val):
    if not val:
        return None
    val = val.strip().strip('"').strip("'")
    val = re.sub(r"\s+", " ", val)
    return val or None


def first_match(text, patterns, flags=re.I | re.S):
    for pattern in patterns:
        m = re.search(pattern, text, flags)
        if m:
            val = m.group(1).strip()
            val = re.sub(r"\s+", " ", val)
            if val:
                return val
    return None


def configure_tesseract():
    try:
        import pytesseract
    except Exception:
        return
    candidates = [
        os.environ.get("TESSERACT_CMD"),
        os.path.join(os.path.dirname(sys.executable), "tesseract"),
        os.path.expanduser("~/miniconda3/bin/tesseract"),
        os.path.expanduser("~/miniforge3/bin/tesseract"),
        os.path.expanduser("~/.local/bin/tesseract"),
        "/usr/bin/tesseract",
        "/usr/local/bin/tesseract",
    ]
    for cmd in candidates:
        if cmd and os.path.isfile(cmd) and os.access(cmd, os.X_OK):
            pytesseract.pytesseract.tesseract_cmd = cmd
            tessdata = os.path.normpath(os.path.join(os.path.dirname(cmd), "..", "share", "tessdata"))
            if os.path.isdir(tessdata) and not os.environ.get("TESSDATA_PREFIX"):
                os.environ["TESSDATA_PREFIX"] = tessdata
            return


def ocr_page(page):
    import fitz

    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    png_bytes = pix.tobytes("png")

    try:
        import pytesseract
        from PIL import Image

        configure_tesseract()
        img = Image.open(io.BytesIO(png_bytes))
        text = pytesseract.image_to_string(img)
        if len(text.strip()) > 40:
            return text
    except Exception:
        pass

    easy_on = os.environ.get("PDF_OCR_EASY", "0").lower() in ("1", "true", "yes")
    if not easy_on:
        return ""

    try:
        import tempfile
        import easyocr

        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp.write(png_bytes)
            tmp_path = tmp.name

        if not hasattr(ocr_page, "_reader"):
            ocr_page._reader = easyocr.Reader(["en"], gpu=False, verbose=False)  # type: ignore[attr-defined]

        lines = ocr_page._reader.readtext(tmp_path, detail=0)  # type: ignore[attr-defined]
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
        return "\n".join(lines)
    except Exception:
        return ""


def extract_text_from_pdf(pdf_path, max_pages=3):
    import fitz

    doc = fitz.open(pdf_path)
    page_count = doc.page_count
    chunks = []
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
        combined = "\n".join(chunks)
        if re.search(r"\d{5}[-\s]?\d{7}[-\s]?\d", combined) and re.search(
            r"verification|complainant|tracking", combined, re.I
        ):
            break

    doc.close()
    return "\n".join(chunks), page_count, used_ocr


def split_name_father(full_name):
    if not full_name:
        return None, None
    m = re.match(r"^(.+?)\s+S/O\s+(.+)$", full_name, re.I)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    m = re.match(r"^(.+?)\s+D/O\s+(.+)$", full_name, re.I)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return full_name.strip(), None


def map_recommendation(text):
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


def parse_verification_report(text, filename):
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
            r"Current\s*Address\s*:?\s*(.+?)(?:Permanent|BRIEF|Brief|RECOMMEND|Online|$)",
            r"Addresses\s*Current\s*Address\s*:?\s*(.+?)(?:Permanent|BRIEF|Brief|Online|$)",
        ],
    )
    permanent_address = first_match(
        text,
        [r"Permanent\s*Address\s*:?\s*(.+?)(?:BRIEF|Brief|RECOMMEND|Online|Contact|$)"],
    )

    victim_email = first_match(
        text,
        [
            r"E-?mail\s*(?:Address)?\s*:?\s*([A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,})",
            r"\b([A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,})\b",
        ],
    )

    crime_category = first_match(
        text,
        [
            r"BRIEF\s*DESCRIPTION\s*OF\s*(?:THE\s*)?CASE\s*:?\s*(.+?)(?:accuse|Accuse|During|Online|City|$)",
            r"BRIEF\s*DESCRIPTION.*?[\n\r]+(.+?)(?:accuse|Accuse|During|Online|$)",
            r"Crime\s*Categor(?:y|ies)\s*:?\s*(.+?)(?:accuse|City|Amount|$)",
            r"(Online\s+Job\s+Frauds)",
        ],
    )

    crime_description = first_match(
        text,
        [
            r"(accuse[d]?\s+defrauded.+?)(?:City|Amount|0f Occurrence|RECOMMEND|$)",
            r"(accuse.+?investment.+?)(?:City|Amount|RECOMMEND|$)",
            r"BRIEF\s*DESCRIPTION[\s\S]{0,80}?((?:During|The|accuse).+?)(?:City\s*of|Amount\s*Involved|RECOMMEND|$)",
        ],
    )

    accused_name = first_match(
        text,
        [
            r"Accuse[d]?\s*(?:Name|Person)?\s*:?\s*(.+?)(?:CNIC|Mobile|Address|City|Amount|$)",
            r"against\s+(?:the\s+)?accuse[d]?\s+([A-Za-z][A-Za-z\s\./]{2,60})",
        ],
    )
    accused_cnic = normalize_cnic(
        first_match(text, [r"Accuse[d]?[^\n]{0,40}CNIC\s*(?:No\.?)?\s*:?\s*([\d\-]+)"])
    )
    accused_phone = first_match(
        text,
        [r"Accuse[d]?[^\n]{0,60}(?:Mobile|Phone|Contact)\s*(?:No\.?|Number)?\s*:?\s*([\d\-]+)"],
    )
    if accused_phone:
        accused_phone = re.sub(r"\D", "", accused_phone)
        if accused_phone.startswith("92") and len(accused_phone) > 10:
            accused_phone = accused_phone[2:]
        if len(accused_phone) == 10:
            accused_phone = "0" + accused_phone

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
            r"Amount\s*Involved\.?\s*:?\s*(?:Rs\.?\s*)?([\d,\.]+)",
            r"Amount\s*Involved\s*:?\s*(?:Rs\.?\s*)?([\d,\.]+)",
            r"Rs\.?\s*([\d,]{3,}(?:\.\d+)?)",
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
        [r"Justification\s*:?\s*(.+?)(?:Reporting Officer|Assistant Sub|Signature|$)"],
    )
    reporting_officer = first_match(
        text,
        [
            r"Reporting\s*Officer\s*:?\s*(.+?)(?:Designation|Rank|Signature|$)",
            r"(?:ASP|ASI|SI|Inspector)\s+([A-Za-z][A-Za-z\s\.]{2,40})",
        ],
    )

    city = clean_value(city)
    address = clean_value(address)
    permanent_address = clean_value(permanent_address)
    crime_category = clean_value(crime_category)
    crime_description = clean_value(crime_description)
    victim_occupation = clean_value(victim_occupation)
    accused_name = clean_value(accused_name)
    reporting_officer = clean_value(reporting_officer)
    if recommendation_text and len(recommendation_text) > 400:
        recommendation_text = recommendation_text[:400] + "…"

    inquiry_no = first_match(
        text,
        [r"E[/\-]\s*(\d+)\s*[/\-]\s*(\d+)", r"Inquiry\s*No\.?\s*:?\s*([A-Z0-9/\-]+)"],
    )
    if inquiry_no and not inquiry_no.upper().startswith("E"):
        m = re.match(r"(\d+)\s*[/\-]\s*(\d+)", inquiry_no)
        if m:
            inquiry_no = f"E/{m.group(1)}/{m.group(2)}"
    if inquiry_no:
        inquiry_no = re.sub(r"\s+", "", inquiry_no)
        inquiry_no = re.sub(r"^E[\-/]?(\d+)[\-/](\d+)$", r"E/\1/\2", inquiry_no, flags=re.I)
    if not inquiry_no:
        inquiry_no = inquiry_ref_from_filename(filename)

    confidence = 0
    for val in [tracking_no, victim_name, victim_cnic, victim_phone, crime_category, city, amount_involved, recommendation_text]:
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
        "victim_email": victim_email,
        "victim_phone": victim_phone,
        "victim_address": address,
        "victim_permanent_address": permanent_address,
        "crime_category": crime_category,
        "crime_description": crime_description,
        "accused_name": accused_name,
        "accused_cnic": accused_cnic,
        "accused_phone": accused_phone,
        "city": city,
        "amount_involved": amount_involved,
        "recommendation": recommendation,
        "recommendation_short": recommendation_text,
        "recommendation_full": recommendation_full,
        "reporting_officer": reporting_officer,
        "inquiry_no": inquiry_no,
        "confidence_score": confidence,
        "raw_text_preview": text[:8000],
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: nccia_pdf_extract.py <pdf_path>"}))
        return 1

    pdf_path = sys.argv[1]
    filename = Path(pdf_path).name
    max_pages = 3
    if len(sys.argv) >= 3:
        try:
            max_pages = max(1, int(sys.argv[2]))
        except ValueError:
            max_pages = 3

    try:
        text, page_count, used_ocr = extract_text_from_pdf(pdf_path, max_pages=max_pages)
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
