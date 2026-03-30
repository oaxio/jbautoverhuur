# JB Autoverhuur Web App

A Next.js web application for JB Autoverhuur (car rental) that generates rental contracts and invoices as PDF documents.

## Project Overview

Staff use this app to:
- Input customer details (name, contact, driver's license)
- Enter vehicle information (license plate, fuel, mileage)
- Set rental terms (dates, rates, deposit)
- Capture digital signatures and damage reports
- Generate PDF rental contracts and invoices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Material UI (MUI) + Tailwind CSS
- **PDF Generation**: pdf-lib (client-side)
- **Signatures**: react-signature-canvas
- **Package Manager**: npm

## Project Structure

- `src/app/` — App Router pages and layout
  - `page.js` — Home/dashboard with pincode auth
  - `createContract/` — Contract creation form + PDF generation
  - `components/` — Reusable components (header, etc.)
  - `helpers/` — PDF template base64 strings
- `public/` — Static assets (background, car damage image)

## Development

```bash
npm run dev   # Starts dev server on port 5000
```

## Deployment

- Build: `npm run build`
- Start: `npm run start` (port 5000)
- Target: autoscale
