# 📋 Plan d'Action & UX Checklist — Meeting 3

Synthesized design fixes and UX improvements extracted from **Meeting 3** transcript, categorized by urgency and impact.

---

## 🔴 Must Fix (Critical / Blocker)

### 1. RSVP Call-to-Action (CTA) Proportion & Ergonomics
* **Key Focus Area:** Call-to-Action (CTA) / Mobile Responsiveness
* **Issue / Feedback:** Accept and Decline buttons lacked clear visual hierarchy and primary action emphasis on mobile viewports.
* **Design Action Item:** 
  * Redesign the main RSVP CTA bar using a **70% / 30% split layout**.
  * **Accept / Confirm (70% width):** High-contrast primary brand color, bold copy, prominent touch target (min 48px height).
  * **Decline (30% width):** Subdued secondary/outline button style to reduce accidental clicks while keeping the option accessible.

---

## 🟡 UX & Workflow Enhancements

### 2. Guest Confirmation (RSVP) & Dietary Preference Workflow
* **Key Focus Area:** User Experience (UX) & Workflow
* **Issue / Feedback:** Guests need to view the menu before confirming and report dietary needs or severe allergies.
* **Design Action Item:** 
  * Integrate an interactive **Menu Preview Drawer/Modal** directly within the RSVP step.
  * Add multi-select tags for dietary options: `Halal`, `Vegetarian`, `Sugar-Free`.
  * Add a mandatory or optional free-form textarea for **Allergies & Dietary Restrictions**.

---

### 3. Guest Management Dashboard & Quick Filters
* **Key Focus Area:** Invitation Redesign & Layout / Dashboard UX
* **Issue / Feedback:** Organizers lacked an efficient overview to inspect guest responses across large events.
* **Design Action Item:** 
  * Implement pagination control (e.g., 10/25/50 items per page) on the Guest List table.
  * Add rapid filter pills at the top of the table: **All**, **Pending**, **Confirmed**, and **Declined** with active count badges.

---

### 4. "Wrong Recipient" & Unsubscribe Option
* **Key Focus Area:** User Experience (UX) / Edge Cases
* **Issue / Feedback:** Misdirected invitations left guests without a clean way to flag errors or remove themselves.
* **Design Action Item:** 
  * Add a subtle footer link on the public invitation page: *"Not the intended recipient? Report error or unsubscribe."*
  * Create a brief confirmation dialog to remove the guest record cleanly without triggering error states for the organizer.

---

### 5. Custom Dish Image Upload Module
* **Key Focus Area:** Workflow & Logic / Media Assets
* **Issue / Feedback:** Using external image URLs for custom catering menus caused broken images and layout shifts.
* **Design Action Item:** 
  * Replace plain URL input fields with a native Drag-and-Drop Image Uploader component.
  * Display explicit client-side validation rules (e.g., *Max size: 5MB*, *Formats: JPG, PNG, WEBP*).
  * Provide an inline image cropper preview before finalizing uploads.

---

### 6. Multi-Option Catering Configuration
* **Key Focus Area:** Invitation Redesign & Layout / Form Controls
* **Issue / Feedback:** Catering needs vary between buffet setups, table service, or hybrid formats.
* **Design Action Item:** 
  * Add a segmented control toggle in the Catering Step: `Buffet`, `Table Service`, `Mixed/Hybrid`.
  * Conditionally display menu selection sub-forms based on the active catering type.

---

## 🟢 Design & Polish

### 7. Creation Stepper Ergonomics & Stepper Bar
* **Key Focus Area:** Visual Hierarchy & Ergonomics
* **Issue / Feedback:** Creation wizard steps lacked visual clarity, progress feedback, and smooth navigation between steps.
* **Design Action Item:** 
  * Refine the Stepper UI header with clear step numbers, active state highlights, and completed checkmarks (`✓`).
  * Ensure full mobile responsiveness for the stepper (collapsing to progress bar or horizontal scrollable pills on smaller screens).

---

### 8. Event Ownership & Metadata Display
* **Key Focus Area:** Layout & Branding
* **Issue / Feedback:** Created events must explicitly indicate the logged-in organizer owner for multi-organizer clarity.
* **Design Action Item:** 
  * Display an **Organizer Profile Badge** (Avatar + Name) on both the internal Event Summary card and the top header of the guest invitation view.

---

### 9. Down Payment & Settlement Tracker UI
* **Key Focus Area:** Layout & Visual Hierarchy
* **Issue / Feedback:** Financial tracking required visual clarity for cash and bank transfer advance payments.
* **Design Action Item:** 
  * Design a 3-card metric summary bar in the Event Settlement tab:
    1. **Total Amount** (Neutral bold display)
    2. **Paid Amount** (Green success accent)
    3. **Remaining Balance** (Amber warning accent)
  * Add a modal form for recording custom down payments with payment type selectors (`Cash`, `Wire Transfer`).

---

### 10. Subscription Module De-emphasis (Paused Feature)
* **Key Focus Area:** Navigation & Workflow Scoping
* **Issue / Feedback:** Subscription billing logic is temporarily paused to prioritize core business features.
* **Design Action Item:** 
  * Hide or disable the subscription/billing entry points in the main navigation menu to avoid user confusion.

---

## 📊 Summary Matrix

| Priority | Feature / Topic | Primary Canvas / Component | Focus Area |
| :--- | :--- | :--- | :--- |
| 🔴 **Must Fix** | 70%/30% RSVP CTA Ergonomics | Invitation Mobile Viewport | CTA / Mobile UX |
| 🟡 **Enhancement** | Menu Preview & Dietary Tagging | RSVP Flow Drawer | Usability / Workflow |
| 🟡 **Enhancement** | Guest Table Quick Status Filters | Guest Management Dashboard | Dashboard UX |
| 🟡 **Enhancement** | Unsubscribe / Wrong Recipient Link | Invitation Footer | Edge Cases |
| 🟡 **Enhancement** | Dish Image Upload & Cropper | Catering Configuration Form | Media & Form UX |
| 🟡 **Enhancement** | Catering Type Selector | Event Form (Catering Step) | Workflow Logic |
| 🟢 **Polish** | Stepper Bar Progress Ergonomics | Event Creation Wizard | Visual Hierarchy |
| 🟢 **Polish** | Organizer Ownership Badge | Event Header / Preview | Layout & Branding |
| 🟢 **Polish** | Settlement Summary Metric Cards | Financial / Billing Tab | Visual Hierarchy |
| 🟢 **Polish** | Hide Subscription Nav Items | Main Navigation Sidebar | Information Architecture |
