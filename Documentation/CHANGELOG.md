# Changelog - EventManager

All notable changes to the **EventManager** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.4.0] - 2026-10-08

### 🌟 Added
- **Mobile-Specific Particle Margin Framing:** Enhanced visual particles engine (`gold-dust`, `rose-petals`, `confetti`, `sparkles-stars`, `bokeh`) to automatically constrain particle positions to lateral margins ($\le 16\%$ left and $\ge 84\%$ right) on mobile screens (`< 992px`) to protect central invitation text legibility, while maintaining full-width atmospheric dispersion on desktop viewports ($\ge 992px$).
- **Dual-Device Live Particle Preview:** Integrated responsive particle coordinate bindings in `AdminTemplates` studio matching the active device preview mode (`previewDevice === 'mobile' | 'desktop'`).
- **Background Wallpaper Synchronization:** Unified desktop & mobile wallpaper asset binding (`templateBackgroundImageDesktopUrl` and `templateBackgroundImageUrl`) across Guest RSVP and Client Portal Invitation Preview.

### ⚡ Performance & Optimization
- **Zero-Delay Template Hydration:** Implemented instant `sessionStorage` hydration in `TemplateService` for immediate template rendering on page load and F5 refresh, eliminating visual loading spinners on navigation.
- **Text Contrast Enhancement:** Removed blurry white text shadows on invitation subtitles in `guest-rsvp.html` for clean contrast over custom luxury backgrounds.

### 🐛 Fixed
- **Client Auth & Event Controllers:** Fixed repository query bindings and domain mapping in `ClientAuthController` and `ClientEventController` for smooth guest data loading.

---

## [2.3.0] - 2026-10-07

### 🌟 Added
- **End-Client Collaboration Portal:** Dedicated private client access portal allowing event hosts to view event milestones, countdown timers, and caterer contact details.
- **Client Guest List Management:** Real-time guest list management allowing hosts to add, edit, group, and track RSVP responses in direct collaboration with the caterer.
- **Direct Client Authentication:** Secure token-based magic link access and authentication endpoints in `ClientAuthController`.
- **Client Culinary Overview:** Real-time menu preferences and dietary requirement breakdown visible directly in the client dashboard.

---

## [2.2.0] - 2026-10-01

### 🌟 Added
- **Luxury Digital Invitation Themes:** Added 5 curated luxury themes (*Fleurs de Coton, Or & Velours, Corporate Professional, Luxury Minimal, Bohème Chic*).
- **Prestigious Opening Animation Engine:** Implemented 5 interactive entrance experiences (*Royal Wax Seal Envelope, Silk Ribbon Cut, Curtain Unveil, Sliding Luxury Doors, VIP Hologram Badge*).
- **Dynamic Google Fonts Loader:** Automatic runtime font loading utility supporting luxury typography (*Alex Brush, Great Vibes, Playfair Display, Cinzel, Montserrat, Cormorant Garamond*).
- **Interactive Ambient Audio Player:** Floating vinyl disc audio widget with rotating vinyl disk animation, equalizing frequency bars, and seamless autoplay upon first interactive guest gesture.

---

## [2.1.0] - 2026-09-18

### 🌟 Added
- **Course-by-Course Gastronomy RSVP:** Multi-step culinary selection workflow supporting:
  - *Plats Fixes:* Sequential selection of Starters, Main Dishes, Desserts, and Beverages.
  - *Buffet:* Full buffet catalog browsing with category badges (*Salé, Chaud, Douceurs, Boissons*).
  - *Mix Formula:* Plated main courses paired with buffet appetizer and dessert stations.
- **Dietary & Allergy Tracking Engine:** Multi-select allergen tags (Gluten, Lactose, Peanuts, Seafood) and dietary requirements (Halal, Kosher, Vegan, Vegetarian).
- **Multi-Channel Invitation Dispatcher:** One-click invitation dispatch center supporting direct WhatsApp Web messaging, Email, and SMS formats in `OrganiserInvitationSetup`.

---

## [2.0.0] - 2026-09-11

### 🌟 Added
- **Admin Digital Template Studio:** Comprehensive template catalog and live customization studio with dual mobile/desktop viewport preview toggles.
- **Event Financials & Expense Ledger:** Complete financial management module (`event_expenses` table, `EventExpenseResource`, `TransactionResource`):
  - Client payment schedules, deposit tracking, and remaining balance monitoring.
  - Itemized event expense logging (raw materials, staff wages, equipment rental, venue fees).
  - Real-time Gross Revenue, Operational Cost, and Net Profit KPI calculations.
- **Printable Receipts & Vouchers:** Instant OS printing and PDF generation for official Client Payment Receipts and Internal Expense Vouchers.
- **Server-Side Excel (.xlsx) & CSV Import Pipeline:** High-performance spreadsheet importer with automatic separator detection and scoped dynamic group validation.

---

## [1.5.0] - 2026-09-01

### 🌟 Added
- **Public RSVP Portal (`/rsvp/:id`):** Secure token-based guest response interface without authentication friction.
- **Event Preparation Checklist:** Task management module (`EventTaskResource`, `event-task.service.ts`) with deadline tracking and completion status.
- **Internationalization (i18n):** Complete multilingual translation engine with French (`fr`), English (`en`), and Arabic (`ar`) locales.
- **Multi-Currency Converter:** Multi-currency support across Moroccan Dirham (`MAD`), Euro (`EUR`), US Dollar (`USD`), British Pound (`GBP`), and Canadian Dollar (`CAD`).

---

## [1.0.0] - 2026-08-31

### 🌟 Added
- **Core SaaS Multi-Tenancy Architecture:** Multi-tenant isolation for caterers with role-based access control (`SUPER_ADMIN`, `CATERER_ADMIN`, `STAFF`, `CLIENT`).
- **Spring Boot 3 Hexagonal Backend:** Clean separation of Domain, Application Services, Infrastructure Adapters, and Presentation REST controllers with Flyway database migrations.
- **Event Lifecycle Wizard:** Multi-step event creation form, status tracking, and event cloning capabilities.
- **Menu Item Catalog:** Management of culinary offerings with multipart image upload and pricing.
- **Stripe Subscription Billing:** Integration with Stripe Checkout and webhooks for SaaS plan management.
