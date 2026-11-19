# Complete Step-by-Step Guide: From Creating a Cloudflare Account to Live Production
## Angelika Fashions (`angelikafashions.com`)

This guide walks you through **every single click and command** from zero to a live Cloudflare production deployment.

---

## STEP 1: Create Your Cloudflare Account & Get Your Account ID

1. Open your browser and go to **[https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)**.
2. Enter your **Email** and **Password**, click **Sign Up**, and verify your email address from your inbox.
3. Once logged into the **Cloudflare Dashboard**:
   - Look at the browser URL bar. It will look like:
     `https://dash.cloudflare.com/1a2b3c4d5e6f7g8h9i0j...`
   - That 32-character string in the URL (or visible on the right sidebar under **Account ID** on the **Workers & Pages** screen) is your **`CLOUDFLARE_ACCOUNT_ID`**.
   - Copy and save it.

---

## STEP 2: Create a Cloudflare API Token (So We Can Automate KV & Deployment for You)

1. In the Cloudflare Dashboard, click the **User Profile Icon** (top-right corner) → **My Profile**.
2. In the left sidebar, click **API Tokens**.
3. Click the blue **Create Token** button.
4. Scroll to the bottom and click **Get started** next to **Create Custom Token**:
   - **Token name**: `Angelika-Fashions-Deploy`
   - **Permissions** (click **+ Add more** to add these 3 rows):
     1. `Account` → `Cloudflare Pages` → `Edit`
     2. `Account` → `Workers KV Storage` → `Edit`
     3. `Account` → `Workers Scripts` → `Edit`
   - **Account Resources**: `Include` → `All accounts` (or select your account).
5. Click **Continue to summary** → **Create Token**.
6. Copy the generated token immediately (it is shown only once). This is your **`CLOUDFLARE_API_TOKEN`**.

---

## STEP 3: Get Your Supabase Production Credentials & Run the Index Migration

1. Go to **[https://supabase.com/dashboard](https://supabase.com/dashboard)** and open your **Angelika Fashions** project.
2. **Apply the New Performance & Contact SQL Migrations**:
   - In the left sidebar, click **SQL Editor** → **+ New query**.
   - Open [supabase/migrations/20261119_update_real_contact_details.sql](file:///e:/Angelika_s/supabase/migrations/20261119_update_real_contact_details.sql) from your repo, paste its contents into the SQL Editor, and click **Run**.
   - Click **+ New query** again, open [supabase/migrations/20261119_cloudflare_edge_perf_indexes.sql](file:///e:/Angelika_s/supabase/migrations/20261119_cloudflare_edge_perf_indexes.sql), paste its contents into the SQL Editor, and click **Run** (this creates all hot-path indexes and optimizes RLS speed).
3. **Copy Your 3 Supabase Keys**:
   - In the left sidebar of Supabase, click **Project Settings** (the gear icon at the bottom) → **API**.
   - Under **Project URL**, copy the URL (e.g., `https://abcdefghijklm.supabase.co`). This is **`NEXT_PUBLIC_SUPABASE_URL`**.
   - Under **Project API keys**:
     - Copy the **`anon` `public`** key. This is **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**.
     - Click **Reveal** on the **`service_role` `secret`** key and copy it. This is **`SUPABASE_SERVICE_ROLE_KEY`** (never share publicly; only for server environment variables).
4. **Verify Storage Buckets**:
   - In the left sidebar of Supabase, click **Storage**.
   - Confirm that the public buckets **`product-images`** and **`media`** exist (if either is missing, click **New bucket**, enter the name, toggle **Public bucket** ON, and click **Save**).

---

## STEP 4: Create the Cloudflare KV Namespace for Distributed Rate Limiting

You can either paste your `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` here in chat so I run this for you, **or** do it in the Cloudflare Dashboard:

### Option A: Via Cloudflare Dashboard (No CLI needed)
1. In the Cloudflare Dashboard left sidebar, expand **Storage & Databases** (or **Workers & Pages**) → click **KV**.
2. Click **Create a namespace**:
   - Enter Name: `angelika-fashions-RATE_LIMIT_KV` → click **Add**.
   - Copy the **ID** shown in the table (a 32-character hex string).
3. Click **Create a namespace** again (for preview deployments):
   - Enter Name: `angelika-fashions-RATE_LIMIT_KV_preview` → click **Add**.
   - Copy its **ID**.
4. Open [wrangler.toml](file:///e:/Angelika_s/wrangler.toml) in your repository and replace `PLACEHOLDER_KV_ID` and `PLACEHOLDER_KV_PREVIEW_ID` with those two IDs:
   ```toml
   [[kv_namespaces]]
   binding = "RATE_LIMIT_KV"
   id = "your_production_kv_id_here"
   preview_id = "your_preview_kv_id_here"
   ```

---

## STEP 5: Gather Your Existing Third-Party Keys from Vercel

Before leaving Vercel, copy your current environment variables so nothing is lost:
1. Open **[https://vercel.com/dashboard](https://vercel.com/dashboard)** → select your **Angelika Fashions** project.
2. Go to **Settings** → **Environment Variables**.
3. Copy the values for:
   - **Cashfree Payments (Primary Indian Payment Gateway)** (from **[https://merchant.cashfree.com/merchants/pg/developers/api-keys](https://merchant.cashfree.com/merchants/pg/developers/api-keys)**):
     - `NEXT_PUBLIC_CASHFREE_ENV` (`production` or `sandbox`)
     - `CASHFREE_ENV` (`production` or `sandbox`)
     - `CASHFREE_APP_ID`
     - `CASHFREE_SECRET_KEY`
     - `CASHFREE_WEBHOOK_SECRET` (optional if using the default `CASHFREE_SECRET_KEY` webhook signing)
   - **Resend Email** (from Vercel or **[https://resend.com/api-keys](https://resend.com/api-keys)**):
     - `RESEND_API_KEY`
     - `EMAIL_FROM` (e.g., `Angelika Fashions <vidhya@angelikafashions.com>`)
   - **Delhivery Shipping** (if active):
     - `DELHIVERY_API_TOKEN`
     - `DELHIVERY_WEBHOOK_SECRET`
     - `DELHIVERY_PICKUP_LOCATION`
   - **Cache Revalidation Secret** (create any strong random string, e.g., `angelika_reval_9f8a7b6c5d4e`):
     - `REVALIDATE_SECRET`
     - `REVALIDATION_SECRET` (set to the same value)

---

## STEP 6: Create & Configure Your Cloudflare Pages Project

You have two ways to deploy: **GitHub Automatic Deployments** (recommended) or **Direct CLI Deployment** (I can run this for you once you provide the credentials).

### How to Set Up via GitHub in Cloudflare Dashboard:
1. Push your latest code commits to your GitHub repository.
2. In the Cloudflare Dashboard left sidebar, click **Workers & Pages**.
3. Click **Create** → switch to the **Pages** tab → click **Connect to Git**.
4. Authorize Cloudflare on your GitHub account and select the **Angelika Fashions** repository → click **Begin setup**.
5. Fill in the **Build settings**:
   - **Project name**: `angelika-fashions`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js`
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
6. Expand **Environment variables (advanced)** and add the following variables (or add them right after project creation under **Settings** → **Environment variables** for both **Production** and **Preview**):
   - `NODE_VERSION` = `20`
   - `NEXT_PUBLIC_SITE_URL` = `https://angelikafashions.com`
   - `NEXT_PUBLIC_SUPABASE_URL` = *(your Supabase URL)*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = *(your Supabase anon key)*
   - `SUPABASE_SERVICE_ROLE_KEY` = *(click "Encrypt" / Secret for your service role key)*
   - `NEXT_PUBLIC_CASHFREE_ENV` = `production`
   - `CASHFREE_ENV` = `production`
   - `CASHFREE_APP_ID` = *(your Cashfree App ID)*
   - `CASHFREE_SECRET_KEY` = *(Encrypt)*
   - `CASHFREE_WEBHOOK_SECRET` = *(Encrypt)*
   - `RESEND_API_KEY` = *(Encrypt)*
   - `EMAIL_FROM` = `Angelika Fashions <vidhya@angelikafashions.com>`
   - `REVALIDATE_SECRET` = *(Encrypt)*
   - `REVALIDATION_SECRET` = *(Encrypt)*
   - *(Plus Delhivery / Stripe / WhatsApp keys if used)*
7. Click **Save and Deploy**.

---

## STEP 7: Enable `nodejs_compat` & Bind the KV Namespace in Cloudflare Pages Settings

While or right after the first build runs:
1. Inside your **`angelika-fashions`** project in Cloudflare **Workers & Pages**, click the **Settings** tab.
2. Go to **Functions** (or **Runtime**):
   - Under **Compatibility date**, set it to **`2024-09-23`** (or later).
   - Under **Compatibility flags**, type **`nodejs_compat`** in both **Production** and **Preview** and click **Save**.
3. Still under **Settings** → **Bindings** (or **Functions** → **KV namespace bindings**):
   - Click **Add** → **KV namespace**:
   - **Variable name**: `RATE_LIMIT_KV`
   - **KV namespace**: select `angelika-fashions-RATE_LIMIT_KV` (Production) and `angelika-fashions-RATE_LIMIT_KV_preview` (Preview).
   - Click **Save**.
4. Go to the **Deployments** tab → click the three dots **`...`** on the latest deployment → **Retry deployment** so it picks up the new `nodejs_compat` flag and KV binding.

---

## STEP 8: Verify Your Staging URL (`https://angelika-fashions.pages.dev`)

Before touching your live domain DNS:
1. Open **`https://angelika-fashions.pages.dev`** (shown at the top of your Cloudflare Pages project).
2. Test these 5 flows:
   - Homepage loads with hero, collections, Vidhya's Picks, and Shop the Look.
   - Click `/shop/kurtis`, `/shop/sarees`, and a product detail page `/product/[slug]`.
   - Add an item to cart and open `/checkout`.
   - Log into `/admin` and verify the dashboard stats load.
   - Check `https://angelika-fashions.pages.dev/api/health`.

---

## STEP 9: Zero-Downtime Domain & DNS Cutover (`angelikafashions.com`)

Once `angelika-fashions.pages.dev` looks good:

1. **Add Custom Domain to Cloudflare Pages**:
   - In your `angelika-fashions` Pages project, click the **Custom domains** tab.
   - Click **Set up a custom domain**.
   - Enter `angelikafashions.com` → click **Continue** → **Activate domain**.
   - Repeat for `www.angelikafashions.com`.
2. **Add Your Domain Zone to Cloudflare DNS** (if `angelikafashions.com` is not already on Cloudflare DNS):
   - In the Cloudflare Dashboard left sidebar, click **Websites** (or **Domains**) → **+ Add a site** / **Onboard a domain**.
   - Enter `angelikafashions.com` → select the **Free ($0)** plan → click **Continue**.
   - Cloudflare will scan your existing DNS records and show you **2 Cloudflare Nameservers** (e.g., `ada.ns.cloudflare.com` and `bob.ns.cloudflare.com`).
   - Log into your domain registrar (GoDaddy, Namecheap, Hostinger, BigRock, etc.), go to **Nameservers** for `angelikafashions.com`, and replace the current nameservers with the 2 Cloudflare nameservers.
3. **Verify SSL/TLS Settings in Cloudflare**:
   - In the Cloudflare Dashboard for `angelikafashions.com`, go to **SSL/TLS** → **Overview**.
   - Set SSL/TLS encryption mode to **Full (strict)**.
   - Go to **SSL/TLS** → **Edge Certificates** and ensure **Always Use HTTPS** is toggled **ON**.

---

## STEP 10: Confirm Webhook URLs & Supabase Auth Redirects

Because you are keeping the exact same domain (`https://angelikafashions.com`), existing webhook URLs pointing to `https://angelikafashions.com/api/webhooks/...` will continue working automatically once DNS points to Cloudflare! Just double-check:

1. **Supabase Auth Redirect URLs**:
   - Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**.
   - Ensure **Site URL** is `https://angelikafashions.com`.
   - Under **Redirect URLs**, ensure both are listed:
     - `https://angelikafashions.com/**`
     - `https://angelika-fashions.pages.dev/**`
2. **Cashfree Webhooks**:
   - Go to **Cashfree Merchant Dashboard** → **Developers** → **Webhooks** (API version `2023-08-01`).
   - Add the webhook endpoint URL: `https://angelikafashions.com/api/webhooks/cashfree` (and `https://angelika-fashions.pages.dev/api/webhooks/cashfree` for staging tests).
   - Enable events: `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK`, and `REFUND_STATUS_WEBHOOK`.
3. **Delhivery / Stripe / WhatsApp Webhooks** (if enabled):
   - Confirm they point to `https://angelikafashions.com/api/webhooks/delhivery`, `/api/webhooks/stripe`, and `/api/webhooks/whatsapp`.

---

## Want Me to Run the CLI Setup & Deployment Directly?

If you want me to configure your local `.env.local`, create the KV namespaces, update `wrangler.toml`, and trigger the build/deploy from here, just paste:
1. `CLOUDFLARE_ACCOUNT_ID` & `CLOUDFLARE_API_TOKEN` (from Steps 1 & 2)
2. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, & `SUPABASE_SERVICE_ROLE_KEY` (from Step 3)
3. Your Razorpay / Resend keys (from Step 5)
