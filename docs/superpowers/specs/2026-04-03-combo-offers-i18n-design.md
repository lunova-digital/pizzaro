# Design Spec: Combo Offers + Bilingual (EN/BN) Support

**Date:** 2026-04-03  
**Status:** Approved

---

## Overview

Two features added to Pizzaro:

1. **Combo Offers** — 3 bundle deals from the Street Chattola menu, manageable via admin panel, orderable from the menu page.
2. **Bilingual UI** — EN / বাংলা toggle in the navbar, persistent via `localStorage`, no page reload needed.

---

## 1. Combo Offers

### Data Model — `models/Combo.ts`

```typescript
{
  name:        string       // "Pizza Combo"
  description: string       // short tagline shown on card
  items:       string[]     // ["BBQ Chicken Pizza", "Margarita Pizza", ...]
  price:       number       // 999
  image:       string       // URL or /uploads/ path
  isAvailable: boolean      // default true
  createdAt:   Date
  updatedAt:   Date
}
```

### Seed Data (3 combos)

| Name | Items | Price |
|------|-------|-------|
| Pizza Combo | BBQ Chicken Pizza, Margarita Pizza, Masala Sausage Pizza, Meatball Special Pizza, 4 Cold Drinks & Wages | ৳999 |
| Meatbox Pizza Combo | BBQ Chicken Pizza (8"), Meatbox 2pis, French Fries, Cold Drinks 2pis | ৳749 |
| Burger Pizza Combo | Spicy Chicken Pizza (8"), French Fries, Chicken Burger 3pis, Cold Drinks 3pis | ৳499 |

### API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/combos` | Public | Returns all `isAvailable: true` combos |
| POST | `/api/combos` | Admin | Create new combo |
| GET | `/api/combos/[id]` | Admin | Single combo |
| PUT | `/api/combos/[id]` | Admin | Update combo |
| DELETE | `/api/combos/[id]` | Admin | Delete combo |

### Cart Integration

`CartItem` in `store/cartStore.ts` gets two optional fields:
```typescript
type?: "pizza" | "combo"   // defaults to "pizza" for backward compat
comboId?: string           // set when type === "combo"
```

Combo cart items use `pizzaId = comboId`, `size = ""`, `toppings = []`. No deduplication for combos (each "Add to Cart" adds a fresh item). `totalPrice()` already works without changes.

### Customer-Facing UI

**`components/menu/ComboCard.tsx`**  
Shows: image, name, item list (bulleted), price badge, "Add to Cart" button.  
Design: dark banner bg (`bg-dark`), orange price badge, white text. Distinct from pizza cards.

**`components/menu/ComboSection.tsx`**  
Fetches `/api/combos` and renders a horizontal scroll row of `ComboCard`s on mobile, 3-column grid on desktop. Shows a "COMBO OFFERS" section header with a fire/tag icon. Appears above the pizza category filter on `/menu`.

**`app/menu/page.tsx`**  
Add `<ComboSection />` between the hero banner and the category filter.

### Admin Panel

**`app/admin/combos/page.tsx`**  
Follows identical pattern to `app/admin/menu/page.tsx`:
- Table list: name, price, items count, availability toggle, edit/delete actions
- Inline add/edit form (slide-in panel or modal):
  - Name (text input)
  - Description (text input)
  - Items (textarea — one per line, split on save to `string[]`)
  - Price (number input, BDT)
  - Image (file upload via existing `FileDropzone` + URL fallback)
  - isAvailable (toggle)
- Delete with confirmation dialog

**`components/layout/AdminSidebar.tsx`**  
Add `{ href: "/admin/combos", label: "Combos", icon: Gift }` after the Menu link.

---

## 2. Bilingual UI (EN / বাংলা)

### Translation File — `lib/translations.ts`

Keyed by language (`"en"` | `"bn"`), structured by section:

```
nav:    menu, cart, login, register, profile, orders, logout
menu:   title, subtitle, searchPlaceholder, customizeOrder,
        comboOffers, addToCart, noPizzas, noPizzasHint,
        items, item, in, matching
combo:  addToCart, sectionTitle
cart:   title, empty, total, checkout, remove, quantity
footer: contact, rights
```

Pizza and combo **names/descriptions** remain in English (proper names from the physical menu).

### Language Context — `contexts/LanguageContext.tsx`

```typescript
type Lang = "en" | "bn"

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (path: string) => string   // e.g. t("nav.menu") → "মেনু"
}
```

**Persistence:** `setLang` writes to `localStorage("lang")` before updating React state. On mount, reads `localStorage("lang")` to restore. Defaults to `"en"` if not set. This ensures language survives page reloads and navigation.

**`app/layout.tsx`** wraps `<SessionProvider>` inside `<LanguageProvider>` so every client component can call `useLang()`.

### Navbar Pill — `components/layout/Navbar.tsx`

Two-segment pill added to the right side of the navbar (before the cart icon):

```
[ EN | বাং ]
```

Active segment: white fill with primary text. Inactive: transparent with dimmed text.  
Clicking either segment calls `setLang("en")` or `setLang("bn")`.

Navbar labels (Menu, Cart, Login etc.) wrapped with `t()`.

### Components Updated

| Component | Keys Used |
|-----------|-----------|
| `Navbar` | nav.* |
| `app/menu/page.tsx` | menu.title, menu.subtitle, menu.searchPlaceholder, menu.noPizzas, menu.noPizzasHint, menu.items, menu.item, menu.in, menu.matching |
| `ComboSection` | menu.comboOffers |
| `ComboCard` | combo.addToCart |
| `PizzaCard` | menu.customizeOrder |
| `Footer` | footer.* |
| `app/cart/` | cart.* |

---

## File Checklist

### New files
- `models/Combo.ts`
- `app/api/combos/route.ts`
- `app/api/combos/[id]/route.ts`
- `components/menu/ComboCard.tsx`
- `components/menu/ComboSection.tsx`
- `app/admin/combos/page.tsx`
- `lib/translations.ts`
- `contexts/LanguageContext.tsx`

### Modified files
- `seed/index.ts` — add 3 combos + Combo model import
- `store/cartStore.ts` — add `type` and `comboId` to `CartItem`
- `components/layout/AdminSidebar.tsx` — add Combos nav link
- `app/layout.tsx` — wrap with `LanguageProvider`
- `components/layout/Navbar.tsx` — add lang pill + `t()` labels
- `app/menu/page.tsx` — add `<ComboSection />`
- `components/menu/PizzaCard.tsx` — use `t("menu.customizeOrder")`
- `components/layout/Footer.tsx` — use `t()` for footer text
- `app/cart/page.tsx` — use `t()` for cart labels

---

## Out of Scope

- Admin-side i18n (admin panel stays English only)
- RTL layout (Bangla is LTR)
- More than 2 languages
- Translating pizza/combo names from the DB
