let qrcode = null;
let qrGenerated = false;

// DOM Elements
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('contentInput');
const copyButton = document.getElementById('copyButton');
const qrButton = document.getElementById('qrButton');

// Event Listeners
titleInput.addEventListener('input', handleInputChange);
contentInput.addEventListener('input', handleInputChange);
copyButton.addEventListener('click', handleCopy);
qrButton.addEventListener('click', generateQr);

function generateUrl() {
    const title = titleInput.value;
    const content = contentInput.value;
    const port = window.location.port ? ':' + window.location.port : '';
    return window.location.hostname + port + '/view.html?' + 't=' + Base64Encode(title) + '&c=' + Base64Encode(content);
}

function Base64Encode(str, encoding = 'utf-8') {
    const bytes = new (TextEncoder || TextEncoderLite)(encoding).encode(str);
    return base64js.fromByteArray(bytes);
}

function handleInputChange() {
    copyButton.textContent = 'UPDATE URL';
    qrButton.textContent = 'UPDATE QR';
}

async function handleCopy() {
    try {
        await navigator.clipboard.writeText(generateUrl());
        copyButton.textContent = 'URL COPIED TO CLIPBOARD';
        copyButton.classList.add('copySuccess');
        setTimeout(() => {
            copyButton.textContent = 'COPY URL';
            copyButton.classList.remove('copySuccess');
        }, 2000);
    } catch (err) {
        copyButton.textContent = 'ERROR GENERATING URL';
        copyButton.classList.add('copyError');
        setTimeout(() => {
            copyButton.textContent = 'COPY URL';
            copyButton.classList.remove('copyError');
        }, 2000);
    }
}

function generateQr() {
    if(qrGenerated) {
        qrcode.clear();
        qrcode.makeCode(generateUrl());
    } else {
        qrcode = new QRCode(document.getElementById("qrcode"), {
            text: generateUrl(),
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        qrGenerated = true;
    }
    qrButton.textContent = "QR GENERATED SUCCESSFULLY";
}
