# Specification

## Summary
**Goal:** Build a mobile-first, offline-first customer and invoice manager that stores data and bill images locally, supports search, preview-before-finalize for invoices, local backup/export/restore, optional Internet Computer cloud backup sync, and image downloads.

**Planned changes:**
- Implement an offline-first local persistence layer for customers, invoices, and attached bill images that survives reloads, plus a clear offline/online status indicator.
- Add customer CRUD with structured fields (name required; phone, email, address, notes optional), including list and detail views.
- Add per-customer invoice CRUD with fields (invoice number, date, line items/description, total, status) and support attaching multiple bill images via file picker.
- Add a “preview before finalize” step for invoice images (thumbnail gallery, larger preview, remove/replace before confirm) and only persist as finalized on explicit confirmation.
- Add offline customer search by name with instant, case-insensitive partial matching.
- Add in-app local backup export (includes data + images) to a downloadable file and restore from that file with overwrite warning/confirmation.
- Add invoice image downloading from invoice detail (single image and all images as a bundled download), working offline.
- Add a Settings screen to customize the app’s displayed name (stored locally) and apply it in navigation/header and backup export filenames/metadata.
- Add basic validation and error handling with clear English messages across customer/invoice creation, image preview/loading, and backup export/import.
- Apply a coherent mobile-first visual theme (avoiding blue/purple as primary accents) with clear navigation between Customers, Customer Detail, Invoice Detail, and Settings.
- Add optional Internet Identity sign-in and Internet Computer backup sync: upload latest backup when signed in + online, and download/restore last cloud backup; disable cloud actions when offline.
- Implement Motoko canister endpoints (single main actor) to store/retrieve a user-scoped backup payload with authenticated access and graceful handling of payload size limits.
- Generate and include static image assets (app icon and simple logo) under `frontend/public/assets/generated` and reference them in the app shell and PWA metadata where applicable.

**User-visible outcome:** Users can manage customers and invoices entirely offline (including bill image attachments), preview images before finalizing invoices, search customers by name, download invoice images, and safely export/restore full backups locally; optionally, signed-in users can sync the latest backup to the Internet Computer and restore it later when online, with a mobile-first UI and customizable app name.
