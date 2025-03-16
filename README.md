![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=102) ![Open Source Love](https://badges.frapsoft.com/os/mit/mit.svg?v=102) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
# Slate  📝
Slate Notes takes html (or other data), compresses it into a URL fragment, and provides a link that can be shared. When it is opened, it renders that data on the receiver’s side. Its live [here](http://iamshouvikmitra.github.io/slate).

# About
Slate Notes are contained entirely within their own link. (Including this one!) This means they're... <br>

💼 Portable - you don't need a server to host them <br>
👁 Private - nothing is sent to–or stored on–this server <br>
🎁 Easy to share as a link or QR code <br>

Slate Notes can hold about as much as a printed page, and there is a lot you can do with that: <br>
✒️ Compose poetry <br>
🛠 Create an app <br>
🐦 Bypass a 140 280 char limit <br>
🎨 Express yourself in ascii <br>

## Hosting
One simple way to host is to forward a domain. Just paste your slate's url in the redirect.<br>

## Technical Details

### How it Works
1. **Data Flow**
   - Content is compressed using LZMA with maximum compression (level 9)
   - Compressed data is converted to base64
   - Base64 is made URL-safe by replacing special characters
   - Final URL contains everything needed to render the content

2. **Compression**
   - Uses LZMA (Lempel-Ziv-Markov chain Algorithm)
   - Typically achieves 30-50% better compression than gzip
   - Maintains UTF-8 encoding for emojis and special characters
   - Allows for longer content in URLs

3. **Features**
   - Client-side compression and decompression
   - No server storage needed
   - Mobile-friendly with native sharing
   - QR code generation for easy mobile sharing
   - Supports text formatting and emojis

4. **Size Limits**
   - Title: 100 characters
   - Content: 5000 characters
   - Compressed size varies based on content type

5. **Browser Support**
   - Modern browsers (Chrome, Firefox, Safari, Edge)
   - Requires JavaScript enabled
   - Uses Web Share API on mobile when available
   - Falls back gracefully for older browsers

### Architecture
```
Content → LZMA Compression → Base64 Encoding → URL-safe Characters → Shareable URL
```

### Contributions
Feel free to open a pull request adding your new features, resolving issues, cleaning code or making this readme super awesome 😎 <br>

### Screenshot.
![Nothing Special, but here it is.](https://i.imgur.com/n0eVpNf.png "Home")

### License
Slate Notes is covered by the MIT License. <br>
Copyright (C) 2018 - 2025 ~ [Shouvik Mitra](http://iamshouvikmitra.github.io) ~ work.shouvikmitra@gmail.com


### Inspiration
This website is an inspiration from [itty.bitty.site](https://bitty.site/edit)
