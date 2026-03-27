# Pizzaro — Full Documentation

**Version:** 1.0
**Stack:** Next.js 16 · Tailwind CSS v4 · MongoDB · NextAuth v5
**Default URL:** http://localhost:3000

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Website Features](#website-features)
   - [Landing Page](#landing-page)
   - [Menu & Pizza Customization](#menu--pizza-customization)
   - [Shopping Cart](#shopping-cart)
   - [Checkout — Guest & Logged-in](#checkout)
   - [Order Tracking](#order-tracking)
   - [User Accounts](#user-accounts)
3. [Admin Panel](#admin-panel)
   - [Accessing the Admin Panel](#accessing-the-admin-panel)
   - [Dashboard](#dashboard)
   - [Orders Management](#orders-management)
   - [Menu Management](#menu-management)
   - [Order Status Reference](#order-status-reference)
4. [API Reference](#api-reference)
5. [Database Seed](#database-seed)
6. [Environment Variables](#environment-variables)

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running (Docker recommended)

### Start MongoDB with Docker

```bash
docker-compose up -d
```

### Install & Run

```bash
npm install
npm run dev       # development
npm run build     # production build
npm start         # production server
```

### Seed the Database

Run this once to populate the menu and create the admin user:

```bash
npx tsx seed/index.ts
```

This creates:
- 4 categories: Classic, Premium, Veggie, Specialty
- 12 pizzas with sizes and topping options
- Admin account: `admin@pizzaro.com` / `admin123`

---

## Website Features

### Landing Page

**URL:** `/`

The homepage introduces Pizzaro and drives visitors to order.

| Section | Description |
|---------|-------------|
| **Hero** | Headline with "Order Now" CTA, floating order confirmation card, rating badge, and stat pills (30-min delivery, 4.9 rating, free delivery over $25) |
| **Featured Pizzas** | 4 hand-picked pizzas with badges (Classic, Bestseller, Popular, Veggie), star ratings, starting price, and hover-reveal Order button |
| **How It Works** | 3-step visual guide: Choose Pizza → We Prepare → Fast Delivery |
| **Delivery Banner** | Full-width gradient section with Home Delivery and Store Pickup option cards |
| **Testimonials** | 3 customer reviews with avatar, role label, star rating, and quote |
| **Footer** | Brand info, Quick Links, Contact details, Opening Hours, and "Open Now" badge |

---

### Menu & Pizza Customization

**URL:** `/menu` · `/menu/[id]`

#### Menu Page (`/menu`)

- Displays all available pizzas in a responsive grid
- **Search bar** — filters pizzas by name in real time
- **Category filter** — button row to show Classic / Premium / Veggie / Specialty / All
- Each **Pizza Card** shows: photo, category badge, name, description, star rating, starting price, and "Customize" button

#### Pizza Detail Page (`/menu/[id]`)

Customers configure their pizza before adding to cart:

| Option | Detail |
|--------|--------|
| **Size** | Small / Medium / Large — price updates live |
| **Extra Toppings** | Toggle any available topping — each adds **$1.50** to the price |
| **Quantity** | +/− controls, minimum 1 |
| **Live Total** | Updates instantly as size, toppings, and quantity change |
| **Add to Cart** | Button turns green with "Added!" confirmation for 2 seconds |

---

### Shopping Cart

**URL:** `/cart`

- Lists all items with size, selected toppings, quantity controls, and line total
- Quantity can be adjusted or items removed directly
- **Delivery fee:** $4.99 if subtotal is under $25; free at $25+
- Pickup orders: always free
- Sticky order summary with subtotal, delivery fee, and grand total
- "Proceed to Checkout" button

Cart state is persisted in `localStorage` (Zustand persist) — items survive page refreshes.

---

### Checkout

**URL:** `/checkout`

No account required — guests can check out without registering.

#### Guest Checkout

When not signed in, a **"Your Details"** section appears at the top:

| Field | Required | Purpose |
|-------|----------|---------|
| Full Name | Yes | Identifies the order |
| Email Address | Yes | Used to track the order later |

> The email address is the key to tracking a guest order. Save it.

A "sign in" link is shown for users who already have an account.

#### Logged-in Checkout

Saved phone number and primary address are auto-filled from the user's profile.

#### Checkout Fields (all users)

| Section | Fields |
|---------|--------|
| **Delivery Method** | Delivery or Pickup (toggle) |
| **Delivery Address** | Street, City, State, ZIP — shown only if Delivery selected |
| **Pickup Info** | Store address shown — no form needed |
| **Contact** | Phone number |
| **Payment** | Cash on Delivery only |

After placing an order, the cart is cleared and the customer is redirected to their order tracking page.

---

### Order Tracking

#### For Logged-in Users

**URL:** `/orders` — order history list
**URL:** `/orders/[id]` — live status tracker for a specific order

#### For Guests (no account needed)

**URL:** `/orders/track`

Anyone can track an order by providing:

1. **Order ID** — shown on the confirmation page after checkout (also in the URL)
2. **Email or Phone** — toggle between the two, then enter the value used at checkout

The system verifies the contact matches the order before showing details.

#### Order Status Tracker

The tracking page shows a 4-step progress bar that updates automatically every 30 seconds:

**Delivery orders:**
```
Order Placed → Preparing → On the Way → Delivered
```

**Pickup orders:**
```
Order Placed → Preparing → Ready for Pickup → Picked Up
```

Each completed step is highlighted in orange. The current step has a pulsing ring. The progress bar fills left to right.

The page also shows:
- Full item list with sizes and toppings
- Delivery address or pickup location
- Order total
- Timestamp

---

### User Accounts

#### Register — `/auth/register`

Fields: Name, Email, Password
Password is hashed with bcrypt before storage. After registration, the user is automatically signed in.

#### Login — `/auth/login`

Email + password login. Password field has a show/hide toggle.
Supports redirect: `/auth/login?redirect=/checkout` will send the user back to checkout after signing in.

#### Profile — `/profile`

Protected page (requires login).

- Update phone number
- Add / remove delivery addresses (street, city, state, ZIP)
- Saved addresses auto-fill at checkout

---

## Admin Panel

### Accessing the Admin Panel

The admin panel is accessible only to users with the `admin` role.

**Default admin credentials (after seeding):**
```
Email:    admin@pizzaro.com
Password: admin123
```

**URL:** `/admin`

After logging in, an **Admin** link appears in the navbar (blue shield icon). On mobile, it appears in the hamburger menu.

> Accessing any `/admin/*` route while not logged in or without admin role redirects to the home page.

---

### Dashboard

**URL:** `/admin`

Shows a real-time summary of today's business performance:

| Stat Card | What it Shows |
|-----------|---------------|
| **Today's Orders** | Total number of orders placed today |
| **Today's Revenue** | Sum of all order totals placed today |
| **Pending Orders** | Orders currently in `placed` or `preparing` status |
| **Completed Today** | Orders with `delivered` or `picked-up` status today |

Below the stat cards: **Recent Orders** — the last 10 orders with order ID, item count, time, total, and status badge.

---

### Orders Management

**URL:** `/admin/orders`

Full table of all orders across all customers.

#### Columns

| Column | Description |
|--------|-------------|
| **Order** | Short order ID (last 6 chars, uppercase, monospace) |
| **Items** | Summary: `2x Margherita, 1x Pepperoni` |
| **Type** | `delivery` or `pickup` |
| **Total** | Order amount |
| **Status** | Color-coded badge + editable dropdown |
| **Time** | Date and time placed |

#### Updating Order Status

Each row has an inline `<select>` dropdown. Changing the value immediately sends a PATCH request to the API and updates the badge in real time — no page reload needed.

Status options available in the dropdown:

| Status | Meaning |
|--------|---------|
| `placed` | Order received, not yet started |
| `preparing` | Kitchen is working on it |
| `out-for-delivery` | Driver is on the way (delivery orders) |
| `delivered` | Order delivered to customer |
| `ready-for-pickup` | Ready at the store (pickup orders) |
| `picked-up` | Customer collected the order |

> When you change an order's status here, the customer's tracking page will reflect the update within 30 seconds (the page polls automatically).

---

### Menu Management

**URL:** `/admin/menu`

Lists all pizzas with image, name, category, description, and starting price.

#### Availability Toggle

Each pizza row has a green/grey circular button (checkmark icon):

- **Green** = pizza is available in the menu
- **Grey** = pizza is hidden from customers

Click to toggle. Takes effect immediately.

#### Add New Pizza

Click **"Add Pizza"** (top right) to expand the add form:

| Field | Required | Notes |
|-------|----------|-------|
| Pizza Name | Yes | Displayed on menu and cart |
| Category | Yes | Must match an existing category name (Classic, Premium, Veggie, Specialty) |
| Description | No | Short description shown on menu card and detail page |
| Image URL | No | Must be from `images.unsplash.com` (configured in `next.config.ts`) |

New pizzas are automatically created with default sizes:
- Small — $9.99
- Medium — $12.99
- Large — $15.99

No toppings are added by default (can be set via the database directly).

#### Delete a Pizza

Click the red trash icon on any pizza row. A confirmation dialog appears before deletion. Deleted pizzas are permanently removed from the database.

#### Edit (Pencil Icon)

Toggles an edit state on the row (UI scaffold). Full edit form can be extended here.

---

### Order Status Reference

| Status | Badge Color | Who Sets It |
|--------|-------------|-------------|
| `placed` | Blue | System (on order creation) |
| `preparing` | Yellow | Admin |
| `out-for-delivery` | Orange | Admin |
| `delivered` | Green | Admin |
| `ready-for-pickup` | Purple | Admin |
| `picked-up` | Green | Admin |

**Typical delivery workflow:**
`placed` → `preparing` → `out-for-delivery` → `delivered`

**Typical pickup workflow:**
`placed` → `preparing` → `ready-for-pickup` → `picked-up`

---

## API Reference

All API routes are under `/api/`.

### Pizzas

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/pizzas` | Public | List all available pizzas (filter by `?category=`) |
| POST | `/api/pizzas` | Admin | Create a new pizza |
| GET | `/api/pizzas/[id]` | Public | Get single pizza |
| PUT | `/api/pizzas/[id]` | Admin | Update pizza (e.g. toggle availability) |
| DELETE | `/api/pizzas/[id]` | Admin | Delete pizza |

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | Public | List all categories |
| POST | `/api/categories` | Admin | Create a category |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders` | User/Admin | Own orders (admin sees all) |
| POST | `/api/orders` | Public | Place an order (guest or logged-in) |
| GET | `/api/orders/[id]` | Flexible | Authenticated: own or admin. Guest: requires `?email=` or `?phone=` |
| PATCH | `/api/orders/[id]` | Admin | Update order status |

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create a new user account |
| GET/POST | `/api/auth/[...nextauth]` | — | NextAuth handler |

### User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/profile` | User | Get own profile (phone, addresses) |
| PUT | `/api/user/profile` | User | Update phone and addresses |

---

## Database Seed

Run:

```bash
npx tsx seed/index.ts
```

Re-running the seed **clears all pizzas and categories** and re-inserts them. Existing orders and users are preserved. The admin user is only created if it does not already exist.

---

## Environment Variables

File: `.env.local`

```env
MONGODB_URI=mongodb://admin:yourpassword@localhost:27017/pizzaro?authSource=admin
NEXTAUTH_SECRET=pizzaro-secret-change-me-in-production
NEXTAUTH_URL=http://localhost:3000
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string. Include `?authSource=admin` for Docker setups with authentication |
| `NEXTAUTH_SECRET` | Random secret used to sign JWT tokens. Change this in production |
| `NEXTAUTH_URL` | Full URL of the app. Must match in production |

---

## Project Structure (Summary)

```
app/
  page.tsx              Landing page
  menu/
    page.tsx            Menu listing + search + category filter
    [id]/page.tsx       Pizza detail — size, toppings, add to cart
  cart/page.tsx         Cart with quantity controls and order summary
  checkout/page.tsx     Checkout (guest + logged-in, delivery + pickup)
  orders/
    page.tsx            Order history (logged-in users)
    [id]/page.tsx       Live order status tracker (polls every 30s)
    track/page.tsx      Guest order tracking form (Order ID + email/phone)
  auth/
    login/page.tsx      Sign in
    register/page.tsx   Create account
  profile/page.tsx      Phone + saved addresses
  admin/
    page.tsx            Dashboard with today's stats
    orders/page.tsx     All orders + inline status update
    menu/page.tsx       Pizza list + add/delete/toggle availability
  api/                  All API route handlers
components/
  layout/               Navbar, Footer, AdminSidebar
  home/                 Hero, FeaturedPizzas, HowItWorks, DeliveryBanner, Testimonials
  menu/                 PizzaCard, CategoryFilter
models/                 Mongoose models: User, Pizza, Category, Order
store/                  Zustand cart store (persisted to localStorage)
lib/                    db.ts, auth.ts, utils.ts
seed/                   Database seed script
```
