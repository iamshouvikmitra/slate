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
const shareButton = document.getElementById('shareButton');

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
shareButton.addEventListener('click', handleMobileShare);

// Initialize counters
updateCounters();

function generateUrl() {
    const title = titleInput.value;
    const content = contentInput.value;

    
    return Promise.all([
        Base64Encode(title),
        Base64Encode(content)
    ]).then(([encodedTitle, encodedContent]) => {
        return window.location.origin + '/view.html?' + 't=' + encodedTitle + '&c=' + encodedContent;
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

// Define SVG templates
const SHARE_SVG = `<span class="desktop-text">Share URL</span><span class="mobile-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1M8 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M8 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 0h2a2 2 0 0 1 2 2v3m2 4H10m0 0 3-3m-3 3 3 3"/></svg></span>`;
const SUCCESS_SVG = `<span class="desktop-text">URL Copied!</span><span class="mobile-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></span>`;
const ERROR_SVG = `<span class="desktop-text">Error!</span><span class="mobile-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg></span>`;

// Update button text handler
function handleInputChange() {
    copyButton.innerHTML = SHARE_SVG;
    qrButton.innerHTML = `<span class="desktop-text">Get QR Code</span><span class="mobile-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h7v3h-7zm0 4h7v3h-7z"/></svg></span>`;
    headerTitle.textContent = titleInput.value || 'Untitled document';
}

async function handleCopy() {
    try {
        if (!validateTitle()) return;
        const url = await generateUrl();
        await navigator.clipboard.writeText(url);
        copyButton.innerHTML = SUCCESS_SVG;
        copyButton.classList.add('copySuccess');
        setTimeout(() => {
            copyButton.innerHTML = SHARE_SVG;
            copyButton.classList.remove('copySuccess');
        }, 2000);
    } catch (err) {
        copyButton.innerHTML = ERROR_SVG;
        copyButton.classList.add('copyError');
        setTimeout(() => {
            copyButton.innerHTML = SHARE_SVG;
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

async function handleMobileShare() {
    try {
        const url = await generateUrl();
        // Copy to clipboard first
        await navigator.clipboard.writeText(url);
        
        if (navigator.share) {
            await navigator.share({
                title: titleInput.value || 'Slate Document',
                text: 'Check out this Slate document',
                url: url
            });
        } else {
            // Fallback for browsers without Web Share API
            copyButton.click();
        }
    } catch (err) {
        console.error('Error sharing:', err);
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

// Add resize listener to handle responsive changes
window.addEventListener('resize', handleInputChange);
