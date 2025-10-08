# ShoeStore - (eCommerce)

## Overview

A modern, full-featured eCommerce platform for selling shoes, built with React, Vite, Tailwind CSS, and Supabase.

## Features

- Browse products with advanced filtering (category, brand, size, price)
- Search functionality
- User authentication (signup/login)
- Shopping cart management
- Checkout with M-Pesa payment integration
- Order tracking
- Admin dashboard for product and order management
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (database is already configured)

### Installation

The project is already set up and ready to use. All dependencies are installed.

### Database Setup

The database schema has been created with the following tables:

- `categories` - Product categories
- `brands` - Shoe brands
- `products` - Product catalog
- `profiles` - User profiles
- `cart_items` - Shopping cart
- `orders` - Customer orders
- `order_items` - Order line items

Sample data has been populated with 8 products from Nike, Adidas, Puma, and New Balance.

### Creating an Admin User

To access the admin dashboard, you need to create an admin user:

1. Sign up for a new account through the website at `/signup`
2. After signup, run this SQL command in Supabase SQL Editor to make your account an admin:

```sql
UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with the email you used to sign up.

3. Log out and log back in to access the admin dashboard at `/admin`

### Admin Dashboard Features

Once logged in as admin, you can:

- **Dashboard** (`/admin`) - View statistics and recent orders
- **Manage Products** (`/admin/products`) - Add, edit, delete, and update product status
- **Manage Orders** (`/admin/orders`) - View and update order statuses

### M-Pesa Payment Integration

The M-Pesa payment integration is set up using an Edge Function. Currently, it's configured as a simulation for testing purposes.

To integrate with actual M-Pesa API:

1. Get M-Pesa API credentials from Safaricom
2. Update the Edge Function at `supabase/functions/mpesa-payment/index.ts`
3. Add your M-Pesa credentials as Supabase secrets

### User Features

Customers can:

- Browse and search products
- Filter by category, brand, size, and price
- View detailed product pages
- Add items to cart
- Complete checkout with M-Pesa
- Track orders
- View order history

### Key Pages

- `/` - Home page with featured products
- `/shop` - Product listing with filters
- `/product/:slug` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/orders` - Order history
- `/login` - Customer login
- `/signup` - Customer registration
- `/admin` - Admin dashboard (requires admin role)

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Build Tool**: Vite
- **Icons**: Lucide React

### Security Features

- Row Level Security (RLS) enabled on all tables
- Admin-only access to product and order management
- Secure authentication with Supabase Auth
- User data isolation

### Development

The dev server is automatically started. You can view the application in your browser.

### Production Build

To create a production build:

```bash
npm run build
```

The build output will be in the `dist` directory.

## Support

For issues or questions, please refer to the documentation or contact support.
