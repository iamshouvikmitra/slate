let qrcode = null;
let qrGenerated = false;

// DOM Elements
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('contentInput');
const copyButton = document.getElementById('copyButton');
const qrButton = document.getElementById('qrButton');
const titleCounter = document.getElementById('titleCounter');
const contentCounter = document.getElementById('contentCounter');
const headerTitle = document.querySelector('.editor-header h1');

// Add max lengths
const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 5000;

// Update character counters
function updateCounters() {
    contentCounter.textContent = `${contentInput.value.length}/${MAX_CONTENT_LENGTH}`;
    
    if (contentInput.value.length > MAX_CONTENT_LENGTH * 0.9) {
        contentCounter.style.color = '#ff4444';
    } else {
        contentCounter.style.color = '#666';
    }
}

function validateTitle() {
    if (titleInput.value.length > MAX_TITLE_LENGTH) {
        alert(`Title is too long. Maximum ${MAX_TITLE_LENGTH} characters allowed.`);
        return false;
    }
    return true;
}

// Event Listeners
titleInput.addEventListener('input', handleInputChange);
contentInput.addEventListener('input', handleInputChange);
copyButton.addEventListener('click', handleCopy);
qrButton.addEventListener('click', generateQr);
titleInput.addEventListener('input', updateCounters);
contentInput.addEventListener('input', updateCounters);

// Initialize counters
updateCounters();

function generateUrl() {
    const title = titleInput.value;
    const content = contentInput.value;
    const port = window.location.port ? ':' + window.location.port : '';
    
    return Promise.all([
        Base64Encode(title),
        Base64Encode(content)
    ]).then(([encodedTitle, encodedContent]) => {
        return window.location.hostname + port + '/view.html?' + 't=' + encodedTitle + '&c=' + encodedContent;
    });
}

function Base64Encode(str) {
    return new Promise((resolve, reject) => {
        try {
            // Step 1: Compress the string using LZMA with highest compression (level 9)
            LZMA.compress(str, 9, (result, error) => {
                if (error) reject(error);
                // Step 2: Convert compressed bytes to base64
                // Step 3: Make URL safe by replacing + and / with - and _
                const compressed = base64js.fromByteArray(new Uint8Array(result))
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');
                resolve(compressed);
            });
        } catch (e) {
            console.error('Error encoding:', e);
            reject(e);
        }
    });
}

// Update button text handler
function handleInputChange() {
    copyButton.textContent = 'Share URL';
    qrButton.textContent = 'Get QR Code';
    headerTitle.textContent = titleInput.value || 'Untitled document';
}

async function handleCopy() {
    try {
        if (!validateTitle()) return;
        const url = await generateUrl();
        await navigator.clipboard.writeText(url);
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

async function generateQr() {
    if (!validateTitle()) return;
    const popover = document.getElementById('qr-popover');
    const qrcodeElement = document.getElementById("qrcode");
    
    try {
        // This uses the same compressed URL as the copy function
        const url = await generateUrl();  // Uses LZMA compression via Base64Encode
        qrcodeElement.innerHTML = '';
        if (qrcode) {
            qrcode.clear();
            qrcode = null;
            qrGenerated = false;
        }
        
        qrcode = new QRCode(qrcodeElement, {
            text: url,  // The compressed URL is used here for QR code
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        qrGenerated = true;
        popover.showPopover();
        qrButton.textContent = "Get QR Code";
    } catch (err) {
        console.error('Error generating QR:', err);
    }
}

// Initialize content if coming from viewer
function initializeFromParams() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edit') === 'true') {
        const title = decodeURIComponent(urlParams.get('t') || '');
        const content = decodeURIComponent(urlParams.get('c') || '');
        titleInput.value = title;
        contentInput.value = content;
        updateCounters();
    }
}

// Add to initialization
document.addEventListener('DOMContentLoaded', initializeFromParams);
