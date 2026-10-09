import pytesseract
from PIL import Image
import io
import re
from datetime import datetime

from app.core.config import settings

pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD


def perform_ocr(image_bytes: bytes) -> str:
    """Converts image bytes to a PIL Image and extracts raw text."""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(image)
    except Exception as e:
        raise ValueError(f"Failed to process image: {str(e)}")


def normalize_date(date_string: str) -> str:
    """Converts OCR date into YYYY-MM-DD format."""
    formats = [
        "%d/%m/%Y",
        "%d/%m/%y",
        "%d-%m-%Y",
        "%d-%m-%y",
        "%Y-%m-%d",
        "%b %d, %Y",
        "%B %d, %Y",
    ]

    for date_format in formats:
        try:
            return datetime.strptime(date_string, date_format).strftime("%Y-%m-%d")
        except ValueError:
            continue

    return datetime.today().strftime("%Y-%m-%d")


def receipt_to_expense(image_bytes: bytes) -> dict:
    """Extracts financial data from OCR text."""
    raw_text = perform_ocr(image_bytes)

    # -------------------------
    # Amount
    # -------------------------
    amount_pattern = r'\d+\.\d{2}'
    found_amounts = [float(a) for a in re.findall(amount_pattern, raw_text)]

    estimated_total = max(found_amounts) if found_amounts else 0.0

    # -------------------------
    # Date
    # -------------------------
    date_pattern = (
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b'
        r'|'
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'
        r'[a-z]* \d{1,2},? \d{4}\b'
    )

    found_dates = re.findall(date_pattern, raw_text)

    if found_dates:
        estimated_date = normalize_date(found_dates[0])
    else:
        estimated_date = datetime.today().strftime("%Y-%m-%d")

    # -------------------------
    # Title
    # -------------------------
    lines = [
        line.strip()
        for line in raw_text.split("\n")
        if line.strip()
    ]

    estimated_title = lines[0] if lines else "Extracted Receipt"

    return {
        "title": estimated_title,
        "amount": estimated_total,
        "transaction_date": estimated_date,
        "category": "Other",
        "raw_text": raw_text,
    }