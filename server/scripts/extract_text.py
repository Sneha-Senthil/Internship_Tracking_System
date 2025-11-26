import sys
import os
from pypdf import PdfReader
import pytesseract
from pdf2image import convert_from_path
from PIL import Image

def extract_text_from_scanned_pdf(pdf_path):
    try:
        # Convert PDF pages to images
        images = convert_from_path(pdf_path)
        
        # Extract text from each image using OCR
        text = ''
        for image in images:
            text += pytesseract.image_to_string(image) + '\n'
        
        return text.strip()
    except Exception as e:
        print(f"Error during OCR: {str(e)}", file=sys.stderr)
        return None

def extract_text_from_pdf(pdf_path):
    try:
        # First try regular PDF text extraction
        pdf_reader = PdfReader(pdf_path)
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        # If we got meaningful text, return it
        if text.strip():
            print("Successfully extracted text from PDF using regular extraction", file=sys.stderr)
            return text
        
        # If no text was found, try OCR
        print("No text found in PDF, trying OCR...", file=sys.stderr)
        text = extract_text_from_scanned_pdf(pdf_path)
        
        if text:
            print("Successfully extracted text using OCR", file=sys.stderr)
            return text
        else:
            print("OCR extraction failed", file=sys.stderr)
            sys.exit(1)
            
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python extract_text.py <pdf_path>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    text = extract_text_from_pdf(pdf_path)
    print(text) 