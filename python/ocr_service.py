import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from paddleocr import PaddleOCR
import tempfile
import os
import re
import logging

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    ocr = PaddleOCR(use_angle_cls=True, lang="ch")
except Exception as e:
    raise e

def load_cedict(file_path):
    cedict = {}
    pattern = re.compile(
        r"^(?P<traditional>\S+)\s+"
        r"(?P<simplified>\S+)\s+"
        r"\[(?P<pronunciation>[^\]]+)\]\s+"
        r"/(?P<meanings>.+)/$"
    )
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            match = pattern.match(line)
            if match:
                trad = match.group('traditional')
                simp = match.group('simplified')
                pronunciation = match.group('pronunciation')
                meanings = match.group('meanings').split('/')

                for form in {trad, simp}:
                    if form not in cedict:
                        cedict[form] = []
                    cedict[form].append({
                        "pinyin": pronunciation,
                        "meaning": meanings,
                        "raw_line": line
                    })
    return cedict

cedict_path = "../CC-CEDICT/cedict_1_0_ts_utf-8_mdbg.txt"
cedict = load_cedict(cedict_path)

def find_words_containing_char(ch: str, cedict: dict, limit=5):
    results = []
    for k, entries in cedict.items():
        if ch in k:
            first_entry = entries[0]
            results.append({
                "word": k,
                "pinyin": first_entry["pinyin"],
                "meaning": "/".join(first_entry["meaning"])
            })
    return results[:limit]

@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        raw_result = ocr.ocr(tmp_path, cls=True)
        os.remove(tmp_path)
        logger.debug(f"OCR raw result: {raw_result}")

        recognized_text_parts = []
        if raw_result and isinstance(raw_result, list):
            for lines in raw_result:
                if lines and isinstance(lines, list):
                    for line in lines:
                        if line and len(line) > 1 and line[1] is not None:
                            recognized_text_parts.append(line[1][0])

        recognized_text = "".join(recognized_text_parts)

        response = {
            "text": recognized_text,
            "details": [],
            "word_details": [],
            "related_words": {}
        }

        if not recognized_text:
            return JSONResponse(content=response, status_code=200)

        for ch in recognized_text:
            char_matches = cedict.get(ch, [])
            if char_matches:
                match = char_matches[0]
                response["details"].append({
                    "char": ch,
                    "pinyin": match["pinyin"],
                    "meaning": "/".join(match["meaning"])
                })
            else:
                response["details"].append({
                    "char": ch,
                    "pinyin": "Desconhecido",
                    "meaning": "Desconhecido"
                })

        exact_matches = cedict.get(recognized_text, [])
        for match in exact_matches:
            response["word_details"].append({
                "word": recognized_text,
                "pinyin": match["pinyin"],
                "meaning": "/".join(match["meaning"])
            })

        unique_chars = set(recognized_text)
        for ch in unique_chars:
            related = find_words_containing_char(ch, cedict, limit=5)
            response["related_words"][ch] = related

        return JSONResponse(content=response, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
