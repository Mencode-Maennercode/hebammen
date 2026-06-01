# Hebammen am Marienhospital Bonn - Website

This is a [Next.js](https://nextjs.org) project for the Hebammen am Marienhospital Bonn website with Google Sheets CMS integration.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Google Sheets CMS Setup

This website uses Google Sheets as a CMS for dynamic content (Aktuelles, FAQ). Follow these steps to set it up:

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" → "Library"
4. Search for "Google Sheets API" and enable it

### 2. Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the service account details:
   - Name: e.g., "hebammen-website"
   - Description: "Service account for Hebammen website"
4. Click "Create and Continue"
5. Skip granting roles (we'll do this in the sheet)
6. Click "Done"

### 3. Download Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" and click "Create"
5. The JSON file will be downloaded automatically
6. **Keep this file secure** - it contains sensitive credentials

### 4. Configure Environment Variables

1. Open the downloaded JSON file
2. Copy the entire content
3. Create a `.env.local` file in the project root (see `.env.example` for reference)
4. Paste the JSON content as the value for `GOOGLE_SHEETS_CREDENTIALS` (make sure it's properly escaped)
5. Add your Google Sheet ID as `GOOGLE_SHEET_ID`

Example `.env.local`:
```env
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
GOOGLE_SHEET_ID=your-sheet-id-here
```

### 5. Grant Sheet Access

1. Open your Google Sheet
2. Click "Share" in the top right
3. Copy the `client_email` from your service account JSON file
4. Paste it as an email address and grant "Editor" permissions
5. Click "Send"

### 6. Sheet Structure

Your Google Sheet should have the following worksheets:

**Aktuelles:**
- Titel (Title)
- Text (Description)
- Bildname (Image URL)
- Datum (Date)
- Kategorie (Category)

**FAQ:**
- Frage (Question)
- Antwort (Answer)
- Kategorie (Category - e.g., "Vor der Geburt", "Während der Geburt", "Nach der Geburt")

**TippsTricks** (optional, for future use):
- Titel (Title)
- Inhalt (Content)
- Kategorie (Category)
- Bildname (Image URL)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

**Important:** When deploying to Vercel, make sure to add the environment variables (`GOOGLE_SHEETS_CREDENTIALS` and `GOOGLE_SHEET_ID`) in your Vercel project settings.
