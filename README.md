# Hanzi Draw Translate

**Hanzi Draw Translate** is an application that enables users to draw Chinese characters (Hanzi) on a canvas and receive instant recognition, translations, and related word suggestions. This project uses a combination of Go for the backend API and Python for OCR functionality, translating predefined Hanzi characters from a dictionary.

---

## Features

- Interactive drawing canvas with pencil and eraser tools.
- Automatic Hanzi recognition powered by PaddleOCR.
- Displays pinyin, meanings, and related words for recognized characters.
- Responsive design optimized for desktop and mobile.
- Integrated Go and Python backend for seamless functionality.

---

## Project Structure

```
├── CC-CEDITCT
│   └── cedict_1_0_ts_utf-8_mdbg.txt   # Dictionary file for character translations
├── controllers
│   └── ocr_controller.go             # Go controller to handle OCR requests
├── public
│   ├── css
│   │   └── draw.css                  # Stylesheet for the application
│   ├── js
│   │   └── draw.js                   # JavaScript for interactive canvas
│   └── index.html                    # Frontend HTML
├── python
│   └── ocr_service.py                # Python OCR service with PaddleOCR
├── go.mod                            # Go module dependencies
├── go.sum                            # Checksums for module dependencies
├── main.go                           # Go application entry point
├── README.md                         # Project documentation
├── requirements.txt                  # Python dependencies
```

---

## Installation

### Prerequisites

- Go 1.18 or higher
- Python 3.8 or higher
- Git
- A virtual environment manager (optional but recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/LCGant/hanzi-draw-translate.git
cd hanzi-draw-translate
```

### 2. Set Up the Python Environment

#### Using Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Build and Run the Go Backend

#### Install Go Dependencies
```bash
go mod tidy
```

#### Start the Go Server
```bash
go run main.go
```

The Go server will be available at `http://127.0.0.1:8080`.

### 4. Start the Python OCR Service
```bash
cd python
uvicorn ocr_service:app --host 0.0.0.0 --port 8000
```

The Python OCR service will be available at `http://127.0.0.1:8000`.

### 5. Access the Frontend
Open in your browser:
```bash
http://127.0.0.1:8080
```
The frontend will be available at `http://127.0.0.1:8080`.

---

## Demo
![Showcase](https://github.com/LCGant/hanzi-draw-translate/blob/main/images/showcase.png)

---

## Usage

1. Open the application in your browser.
2. Draw a Hanzi character on the canvas using the pencil or eraser tool.
3. The application will recognize the character and display:
   - **Text**: The recognized Hanzi character.
   - **Pinyin**: Pronunciation of the character.
   - **Meaning**: Translation or meaning of the character.
   - **Related Words**: Words containing the recognized character.

4. Use the "Eraser" button to toggle between eraser and pencil mode.

---

## Dependencies

### Python
- `fastapi`: Backend framework for the OCR service.
- `uvicorn`: ASGI server for FastAPI.
- `paddleocr`: Optical character recognition for Hanzi.

Install these dependencies using:
```bash
pip install -r requirements.txt
```

### Go
- `github.com/gin-gonic/gin`: Web framework for the Go backend.

---

## Acknowledgements

This project leverages:
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) for character recognition.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m "Add a new feature"`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

---

## Contact

Created by [LCGant](https://github.com/LCGant). For questions or suggestions, please open an issue or contact directly.

