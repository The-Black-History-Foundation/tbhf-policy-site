# TBHF Policy Site

Policy and landing site for **The Black History Foundation** — federal policies affecting Black history preservation, mission, donate (Bitcoin + Fiat), volunteer, and FAQ.

## Features

- **Policy database** — Federal policies (Bills and Executive Orders) with impact (positive/negative/mixed), filters, search, and sort
- **Firebase backend** — Firestore for policies, Auth for admin
- **Congress.gov API** — Fetch bill data for policy entries
- **Federal Register API** — Search and fetch Executive Orders by number or keyword
- **Admin page** — Manage policies, AI agent to search/recommend/fetch (bills + EOs), tabbed UI (AI Agent / Policies & EOs)
- **Take Action** — Find your rep, volunteer, donate, subscribe
- **Donate** — Bitcoin (Lightning + on-chain) and Fiat (Zeffy)
- **Navigation** — Main nav includes Home (top of home page), Mission, Policies, Take Action, FAQ, Contact, Donate

## Project Structure

```
tbhf-policy-site/
├── index.html
├── policies.html
├── policy.html
├── admin.html
├── donate-bitcoin.html
├── package.json
├── vite.config.js
├── .env.example          # Copy to .env
├── .env                  # Your secrets (gitignored)
├── src/
│   ├── config.js             # Reads from import.meta.env
│   ├── main.js
│   ├── firebase-app.js
│   ├── congress-api.js
│   ├── federal-register-api.js  # Federal Register API for Executive Orders
│   ├── policies.js
│   ├── policies-page.js
│   ├── policy-detail.js
│   ├── policy-detail.css
│   ├── admin.js
│   └── donate-btc.js
├── functions/             # Cloud Functions (AI agent)
├── data/
└── public/                # Static assets (logo, images)
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
- `VITE_BITCOIN_ADDRESS`, `VITE_BTCPAY_URL`, `VITE_LIGHTNING_ADDRESS` / `VITE_LIGHTNING_LNURL`
- `VITE_VOLUNTEER_URL`
- `VITE_CONGRESS_API_KEY` — free at [api.data.gov/signup](https://api.data.gov/signup/)
- `VITE_AI_AGENT_URL` — optional; Cloud Function URL for AI summary drafting
- `VITE_FIREBASE_*` — from Firebase Console > Project Settings > Your apps

### 3. Firebase

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore** and **Authentication** (Email/Password)
3. Create an admin user in Authentication > Users
4. Deploy: `firebase deploy`

### 4. Run

```bash
npm run dev      # Development server (http://localhost:5173)
npm run build    # Build for production (output in dist/)
npm run preview  # Preview production build
```

## AI Agent (Cloud Function - Claude)

You only need your Claude API key. The AI agent URL is created when you deploy the function.

1. `cd functions && npm install`
2. Deploy: `firebase deploy --only functions`
3. On first deploy, the CLI will prompt for `ANTHROPIC_API_KEY` — enter your Claude key (starts with `sk-ant-`)
4. After deploy, Firebase prints the function URL. Copy it into `.env` as `VITE_AI_AGENT_URL`

To update the key later: create/update the secret in [Google Cloud Secret Manager](https://console.cloud.google.com/security/secret-manager), then redeploy.

## Admin

- URL: `admin.html` (or `/admin.html` in dev)
- Sign in with Firebase Auth
- **Tabs**: AI Agent (search/fetch) and Policies & EOs (list + form)
- Add policies manually or fetch from Congress.gov (bills) or Federal Register (Executive Orders)
- Policy type: Bill or Executive Order — conditional fields for congress/bill number vs EO number and Federal Register URL
- Use AI agent to search Executive Orders by keyword, fetch by EO number, or fetch bills by number
- Use AI agent to draft impact summaries (requires Cloud Function)

## Policies Page

- **Filters**: Type (Bill / Executive Order), Impact, Status, Search
- **Sort**: Newest first, Oldest first, Title A–Z, Title Z–A, Impact

## Policy Detail Page

- Full-width layout for readability
- Executive Orders: Federal Register link; summary hidden by default with "Show Executive Order Summary" toggle

## License

MIT — The Black History Foundation
