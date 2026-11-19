# Cloudflare Workers Compatibility Audit Report

**Project:** Angelika Fashions (`e:\Angelika_s`)  
**Target Environment:** Cloudflare Pages with `@cloudflare/next-on-pages` (`nodejs_compat` enabled)  
**Date:** November 19, 2026  
**Auditor:** `nodejs-compat` Swarm Worker  

---

## 1. Executive Summary

During migration from Vercel to Cloudflare Pages, dependencies relying on native Node.js addons (`.node` C++ bindings) or Node.js-only C/POSIX/filesystem APIs must be resolved or decoupled. This audit evaluated three primary suspect packages:
1. `socket.io-client`
2. `pdfkit`
3. `sharp`

---

## 2. Dependency Audit & Findings

### 2.1 `socket.io-client` (v4.7.5)
* **Codebase Search Pattern:** `socket\.io` across all TypeScript (`.ts`, `.tsx`), JavaScript, and component files.
* **Findings:** **0 usages detected** in application code (`app/`, `lib/`, `components/`, etc.).
* **Status:** **Dead Code**. Likely introduced during early prototyping or scaffolding.
* **Impact on Cloudflare:** None in runtime, but bloats deployment bundle and dependencies.
* **Action Required:** Safe for immediate removal from `package.json`.

---

### 2.2 `pdfkit` (v0.15.0) & `@types/pdfkit` (v0.13.2)
* **Codebase Search Pattern:** `pdfkit|PDFDocument` across all codebase files outside `node_modules`.
* **Findings:** **0 usages detected** in application code.
* **Status:** **Dead Code / Unimplemented Feature**. Intended for PDF invoice/receipt generation, but never wired into server routes.
* **Compatibility Risk:** `pdfkit` depends heavily on Node.js native filesystem (`fs`) streams and zlib buffers, which are unsupported in Cloudflare edge runtime.
* **Migration Path:**
  * Created a dedicated Supabase Edge Function: `e:\Angelika_s\supabase\functions\generate-invoice\index.ts`.
  * The Edge Function fetches order details and renders a clean, printable HTML tax invoice compliant with Indian GST requirements, triggering browser native print-to-PDF (`window.print()`).
  * Cloudflare Pages can invoke this function via standard fetch or client redirect, keeping worker bundle lightweight and Node.js-free.
* **Action Required:** Remove `pdfkit` and `@types/pdfkit` from `package.json`.

---

### 2.3 `sharp` (v0.33.3)
* **Codebase Search Pattern:** `sharp` across all codebase files outside `node_modules`.
* **Findings:**
  * **Imports Found:** `e:\Angelika_s\lib\image-processing.ts` (lines 1, 94, 104, 124).
  * **Importers of `image-processing.ts`:**
    * `app/api/admin/images/upload/route.ts` (processes uploaded product images into WebP/AVIF/JPEG responsive variants and blur placeholders, then uploads to Supabase Storage).
    * `app/api/admin/images/primary/route.ts`
    * `app/api/admin/images/reorder/route.ts`
  * **Next.js Default Image Optimization:** Next.js uses `sharp` under the hood when `unoptimized: false`.
* **Compatibility Risk:** `sharp` relies on compiled native libvips binaries (`.node` addons). Native C/C++ addons **cannot execute** inside Cloudflare Workers V8 isolates.
* **Migration Strategy:**
  1. **Next.js Frontend Images:** Configure `images: { unoptimized: true }` in `next.config.mjs` (handled by the `@infra` worker). This disables Next.js runtime image resizing inside the edge worker.
  2. **Image Delivery & Transformations:** Serve images directly from Supabase Storage or offload dynamic resizing to Cloudflare Images / Supabase Storage Image Transformations (`/render/image/...`).
  3. **Admin Image Processing Pipeline:**
     * Admin image processing currently in `lib/image-processing.ts` should either:
       - Be offloaded to a Supabase Edge Function / background worker with Deno/WASM image processing, or
       - Utilize Supabase Storage Transformation API directly on upload without local sharp manipulation.
* **Action Required:** Remove `sharp` from `package.json` dependencies once image upload is routed to Supabase/Cloudflare image pipeline.

---

## 3. Recommended `package.json` Modifications

> **Note:** As per migration protocol, `package.json` was audited in read-only mode and not directly modified by this worker. The repository coordinator or package manager lead should apply these updates:

### Dependencies to Remove:
```json
{
  "dependencies": {
    "pdfkit": "0.15.0",           // REMOVE: Dead code & incompatible with Workers runtime
    "sharp": "0.33.3",             // REMOVE: Native addon incompatible with Workers runtime
    "socket.io-client": "4.7.5"    // REMOVE: Dead code
  },
  "devDependencies": {
    "@types/pdfkit": "0.13.2"      // REMOVE: Associated types for removed dependency
  }
}
```

---

## 4. Deliverables Created

1. **Supabase Edge Function:**
   * Code: `e:\Angelika_s\supabase\functions\generate-invoice\index.ts`
   * Documentation: `e:\Angelika_s\supabase\functions\generate-invoice\README.md`
2. **Compatibility Audit Report:**
   * `e:\Angelika_s\docs\cloudflare-compat-report.md`
