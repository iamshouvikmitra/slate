let qrcode = null;
let qrGenerated = false;

// DOM Elements
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('contentInput');
const titleCounter = document.getElementById('titleCounter');
const contentCounter = document.getElementById('contentCounter');
const headerTitle = document.querySelector('.editor-header h1');
const shareButton = document.getElementById('shareButton');
const themeButton = document.getElementById('themeButton');
const lightIcon = document.querySelector('.light-icon');
const darkIcon = document.querySelector('.dark-icon');
const sharePopover = document.getElementById('share-popover');
const shareUrlInput = document.getElementById('shareUrlInput');
const copyLinkButton = document.getElementById('copyLinkButton');
const shortenUrlButton = document.getElementById('shortenUrlButton');
const shortUrlContainer = document.getElementById('shortUrlContainer');
const shortUrlInput = document.getElementById('shortUrlInput');
const copyShortUrlButton = document.getElementById('copyShortUrlButton');
const shortUrlStatus = document.getElementById('shortUrlStatus');

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

// Theme functions
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
    
    // Update QR code colors if it's already generated
    if (qrGenerated) {
        updateQrColors();
    }
}

function updateThemeIcons(theme) {
    if (theme === 'dark') {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'block';
    } else {
        lightIcon.style.display = 'block';
        darkIcon.style.display = 'none';
    }
}

// Event Listeners
titleInput.addEventListener('input', handleInputChange);
contentInput.addEventListener('input', handleInputChange);
titleInput.addEventListener('input', updateCounters);
contentInput.addEventListener('input', updateCounters);
shareButton.addEventListener('click', handleShare);
themeButton.addEventListener('click', toggleTheme);
copyLinkButton.addEventListener('click', () => copyToClipboard(shareUrlInput.value, copyLinkButton));
shortenUrlButton.addEventListener('click', createShortUrl);
copyShortUrlButton.addEventListener('click', () => copyToClipboard(shortUrlInput.value, copyShortUrlButton));

// Initialize
updateCounters();
initTheme();

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

// Update input handler
function handleInputChange() {
    if (headerTitle) {
        headerTitle.textContent = titleInput.value || 'Untitled document';
    }
}

// Combined share handler for both mobile and desktop
async function handleShare() {
    if (!validateTitle()) return;
    
    try {
        const url = await generateUrl();
        
        // Open our custom share popup for all devices
        openSharePopover(url);
        
        // We can also use native sharing on mobile if needed in the future
        // Commented out for now to ensure consistent behavior across all devices
        /*
        if (navigator.share) {
            await navigator.share({
                title: titleInput.value || 'Slate Document',
                text: 'Check out this Slate document',
                url: url
            });
        } else {
            openSharePopover(url);
        }
        */
    } catch (err) {
        console.error('Error sharing:', err);
    }
}

// Function to copy text to clipboard with feedback
async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        const originalHTML = button.innerHTML;
        button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
        button.classList.add('copySuccess');
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copySuccess');
        }, 2000);
        return true;
    } catch (err) {
        console.error('Failed to copy: ', err);
        button.classList.add('copyError');
        setTimeout(() => {
            button.classList.remove('copyError');
        }, 2000);
        return false;
    }
}

async function openSharePopover(url) {
    if (!url) {
        if (!validateTitle()) return;
        try {
            url = await generateUrl();
        } catch (err) {
            console.error('Error generating URL:', err);
            return;
        }
    }
    
    try {
        // Set the URL in the input field
        shareUrlInput.value = url;
        
        // Reset the short URL section
        shortUrlContainer.style.display = 'none';
        shortUrlInput.value = '';
        shortUrlStatus.textContent = '';
        
        // Generate QR code
        generateQrForPopover(url);
        
        // Show the popover
        sharePopover.showPopover();
    } catch (err) {
        console.error('Error opening share popover:', err);
    }
}

function generateQrForPopover(url) {
    const qrcodeElement = document.getElementById("qrcode");
    
    try {
        qrcodeElement.innerHTML = '';
        if (qrcode) {
            qrcode.clear();
            qrcode = null;
            qrGenerated = false;
        }
        
        qrcode = new QRCode(qrcodeElement, {
            text: url,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        qrGenerated = true;
        
        // Update QR code colors for dark mode
        updateQrColors();
    } catch (err) {
        console.error('Error generating QR:', err);
    }
}

function updateQrColors() {
    if (qrGenerated && qrcode) {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        if (currentTheme === 'dark') {
            document.querySelectorAll('#qrcode img').forEach(img => {
                if (img.src && img.src.includes('data:image')) {
                    // For dark mode, invert the QR code colors for better visibility
                    img.style.filter = 'invert(1)';
                }
            });
        } else {
            document.querySelectorAll('#qrcode img').forEach(img => {
                img.style.filter = 'none';
            });
        }
    }
}

// This function is replaced by the unified handleShare() function above

// Function to create short URL using the spoome service
async function createShortUrl() {
    try {
        // Get the long URL
        const longUrl = shareUrlInput.value;
        if (!longUrl) {
            shortUrlStatus.textContent = 'Error: No URL to shorten';
            return;
        }

        // Show loading state
        shortenUrlButton.disabled = true;
        shortenUrlButton.textContent = 'Creating...';
        shortUrlStatus.textContent = 'Creating short URL...';

        // Create URL shortener request
        const url = 'https://spoo.me/';
        const data = new URLSearchParams();
        data.append('url', longUrl);
        
        // We'll use fetch instead of XMLHttpRequest
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: data
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result && result.shorturl) {
            // Show the short URL input and update its value
            shortUrlContainer.style.display = 'flex';
            shortUrlInput.value = result.shorturl;
            shortUrlStatus.textContent = 'Short URL created successfully!';
            shortUrlStatus.style.color = 'var(--success-color)';
        } else {
            throw new Error('Invalid response from URL shortener service');
        }
    } catch (err) {
        console.error('Error creating short URL:', err);
        shortUrlStatus.textContent = `Error: ${err.message || 'Could not create short URL'}`;
        shortUrlStatus.style.color = 'var(--error-color)';
    } finally {
        // Reset button state
        shortenUrlButton.disabled = false;
        shortenUrlButton.textContent = 'Create Short URL';
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
