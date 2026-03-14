# TBHF Policy Site

Static policy and landing site for **The Black History Foundation** — mission, donate (Bitcoin + Fiat), volunteer, and FAQ.

## Features

- **Hero** — Logo, mission statement, unity image, Donate/Get Involved CTAs
- **Mission** — Four value areas with images: Cultural Heritage, Innovation, Community, Education
- **Donate** — Bitcoin (Lightning + on-chain) and Fiat (Zeffy embedded form)
- **Bitcoin modal** — QR code and address in a popup modal; also available as standalone `donate-bitcoin.html`
- **Volunteer** — Four roles with links to tbhfdn.org
- **FAQ** — Common questions about donations and involvement

## Project Structure

```
tbhf-policy-site/
├── index.html          # Main page
├── donate-bitcoin.html # Standalone Bitcoin donation page (QR code)
├── styles.css
├── main.js
├── config.js
├── public/
│   ├── logo.png
│   ├── unity.png
│   ├── cultural.png
│   ├── innovation.png
│   ├── community.png
│   └── education.png
└── README.md
```

## Setup

1. **Configure** `config.js`:
   - `BITCOIN_ADDRESS` — On-chain Bitcoin address (required for QR code and copy)
   - `BTCPAY_URL` — BTCPay Server payment page (Lightning + on-chain), or leave empty
   - `LIGHTNING_ADDRESS` or `LIGHTNING_LNURL` — Optional Lightning options
   - `DDME_URL` — DDME platform (if re-enabled)
   - `VOLUNTEER_URL` — Volunteer page (default: tbhfdn.org/volunteer)

2. **Serve** the site (static files):
   ```bash
   # Option A: Python
   python -m http.server 5500

   # Option B: Node
   npx serve .

   # Option C: Open index.html directly (some features may not work)
   ```

3. **Deploy** to Netlify, Vercel, GitHub Pages, or any static host.

## Bitcoin Donations

- **On-chain**: Set `BITCOIN_ADDRESS` in config. Copy button and QR code (in modal or `donate-bitcoin.html`) use this address.
- **Lightning**: Set `BTCPAY_URL`, `LIGHTNING_ADDRESS`, or `LIGHTNING_LNURL` in config. If none are set, the Lightning button shows "Configure Lightning in config.js".
- **Modal**: Click "View donation page with QR code" to open a popup with address and QR code.

## Fiat Donations

Embedded Zeffy donation form for credit card, debit card, and bank transfer.

## License

MIT — The Black History Foundation
