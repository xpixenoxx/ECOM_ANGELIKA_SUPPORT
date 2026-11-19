# generate-invoice Edge Function

Generates HTML invoices for orders. Replaces pdfkit (Node.js-only) for Cloudflare Workers compatibility.

## Deploy
```bash
supabase functions deploy generate-invoice
```

## Usage
POST to /functions/v1/generate-invoice with:
```json
{ "orderId": "uuid-here" }
```
Returns printable HTML invoice.
