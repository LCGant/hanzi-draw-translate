const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 500;
canvas.height = 500;

let drawing = false;
let eraserMode = false;
const eraserRadius = 20;

function getPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (event.touches) {
        const touch = event.touches[0];
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
    } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    }
    return { x, y };
}

canvas.addEventListener('mousedown', (event) => {
    drawing = true;
    const { x, y } = getPointerPosition(event);
    drawLine(x, y);
});

canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    drawing = true;
    const { x, y } = getPointerPosition(event);
    drawLine(x, y);
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
    recognizeText();
});

canvas.addEventListener('touchend', () => {
    drawing = false;
    ctx.beginPath();
    recognizeText();
});

function drawLine(x, y) {
    if (eraserMode) {
        ctx.clearRect(x - eraserRadius, y - eraserRadius, eraserRadius * 2, eraserRadius * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, eraserRadius, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

canvas.addEventListener('mousemove', (event) => {
    if (!drawing) return;
    const { x, y } = getPointerPosition(event);
    drawLine(x, y);
});

canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    if (!drawing) return;
    const { x, y } = getPointerPosition(event);
    drawLine(x, y);
});

document.getElementById('eraserButton').addEventListener('click', () => {
    eraserMode = !eraserMode;
    const eraserBtn = document.getElementById('eraserButton');
    if (eraserMode) {
        eraserBtn.textContent = "Eraser ON";
        eraserBtn.classList.add('primary-button');
        eraserBtn.classList.remove('secondary-button');
        canvas.style.cursor = `url(https://cdn-icons-png.flaticon.com/512/387/387561.png) 16 16, auto`;
    } else {
        eraserBtn.textContent = "Eraser OFF";
        eraserBtn.classList.add('secondary-button');
        eraserBtn.classList.remove('primary-button');
        canvas.style.cursor = `url(https://cdn-icons-png.flaticon.com/512/60/60992.png) 16 16, auto`;
    }
});

document.getElementById('clearButton').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('ocrResult').textContent = "";
    document.getElementById('translationResult').innerHTML = "";
    document.getElementById('relatedWords').innerHTML = "";
});

document.getElementById('copyButton').addEventListener('click', () => {
    const ocrText = document.getElementById('ocrResult').textContent; 

    if (ocrText && ocrText !== "No text recognized") {
        navigator.clipboard.writeText(ocrText).then(() => {
            alert('Text copied to clipboard!');
        }).catch(err => {
            alert('Failed to copy: ' + err);
        });
    } else {
        alert('No recognizable text found to copy.');
    }
});

function recognizeText() {
    const dataURL = canvas.toDataURL('image/png');

    document.getElementById('ocrResult').textContent = "";
    document.getElementById('translationResult').innerHTML = "";
    document.getElementById('relatedWords').innerHTML = "";

    fetch('/recognize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageData: dataURL })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Server response:', data);

        if (data.text) {
            document.getElementById('ocrResult').textContent = `Recognized text: ${data.text}`;
        } else {
            document.getElementById('ocrResult').textContent = "No text recognized";
        }

        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
            let detailsHTML = '<h3>Character Details:</h3>';
            detailsHTML += '<table><thead><tr><th>Character</th><th>Pinyin</th><th>Meaning</th></tr></thead><tbody>';
            data.details.forEach(item => {
                detailsHTML += `
                <tr>
                    <td>${item.char}</td>
                    <td>${item.pinyin}</td>
                    <td>${item.meaning}</td>
                </tr>`;
            });
            detailsHTML += '</tbody></table>';
            document.getElementById('translationResult').innerHTML += detailsHTML;
        }

        if (data.word_details && Array.isArray(data.word_details) && data.word_details.length > 0) {
            let wordDetailsHTML = '<h3>Full Word Details:</h3>';
            wordDetailsHTML += '<table><thead><tr><th>Word</th><th>Pinyin</th><th>Meaning</th></tr></thead><tbody>';
            data.word_details.forEach(item => {
                wordDetailsHTML += `
                <tr>
                    <td>${item.word}</td>
                    <td>${item.pinyin}</td>
                    <td>${item.meaning}</td>
                </tr>`;
            });
            wordDetailsHTML += '</tbody></table>';
            document.getElementById('translationResult').innerHTML += wordDetailsHTML;
        }

        if (data.related_words) {
            let relatedHTML = '';
            for (let ch in data.related_words) {
                let wordList = data.related_words[ch];
                if (wordList.length > 0) {
                    relatedHTML += `<h4>Character: ${ch}</h4>`;
                    relatedHTML += '<table><thead><tr><th>Word</th><th>Pinyin</th><th>Meaning</th></tr></thead><tbody>';
                    wordList.forEach(item => {
                        relatedHTML += `
                        <tr>
                            <td>${item.word}</td>
                            <td>${item.pinyin}</td>
                            <td>${item.meaning}</td>
                        </tr>`;
                    });
                    relatedHTML += '</tbody></table>';
                } else {
                    relatedHTML += `<h4>Character: ${ch} (no suggestions)</h4>`;
                }
            }
            document.getElementById('relatedWords').innerHTML = relatedHTML;
        }
    })
    .catch(err => {
        console.error('Error sending image for recognition:', err);
        document.getElementById('ocrResult').textContent = `Error sending image: ${err}`;
        document.getElementById('translationResult').innerHTML = "";
    });
}
