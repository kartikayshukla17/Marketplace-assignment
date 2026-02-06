# B2B Marketplace Module

A full-stack marketplace application where users can offer services/products and connect commercially. Built with Next.js, Express, Prisma, and MongoDB.

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend** (Vercel) | [https://marketplace-frontend.vercel.app](https://marketplace-frontend.vercel.app) |
| **Backend** (Render) | [https://marketplace-api.onrender.com](https://marketplace-api.onrender.com) |

> **Note:** Backend may take 30-60 seconds to wake up on first request (Render free tier).

---

## Test Credentials

Use these credentials to login and test the application:

### Regular Users
| Name | Email | Password |
|------|-------|----------|
| Alice Johnson | alice@test.com | password123 |
| Bob Smith | bob@test.com | password123 |
| Charlie Brown | charlie@test.com | password123 |
| Diana Prince | diana@test.com | password123 |
| Edward Blake | edward@test.com | password123 |
| Fiona Green | fiona@test.com | password123 |

### Admin Users
| Name | Email | Password |
|------|-------|----------|
| Admin One | admin1@test.com | admin123 |
| Admin Two | admin2@test.com | admin123 |

Each user has 6 pre-created listings (4 fixed-price, 2 quote-based).

## Features

### Core Functionality
- **Listings Management** - Create, edit, and manage service/product listings
- **Purchase Requests** - Send and manage purchase orders with full lifecycle
- **Role-Based Access** - Buyer, Seller, and Admin permissions
- **Order Lifecycle** - `requested → accepted → completed` or `requested → rejected`

### User Roles
| Role | Capabilities |
|------|-------------|
| **Seller** | Create/manage listings, accept/reject orders, provide quotes |
| **Buyer** | Browse listings, send purchase requests, accept/reject quotes |
| **Admin** | View all data, block/unblock users and listings |

### Additional Features
- Search listings by title
- Filter by category
- Server-side pagination
- JWT authentication with HTTP-only cookies
- API rate limiting
- Input validation with Zod

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **State Management** | Redux Toolkit + RTK Query |
| **Styling** | Tailwind CSS, Shadcn UI |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB with Prisma ORM |
| **Auth** | JWT with bcrypt password hashing |
| **Validation** | Zod |

---

## Project Structure

```
Marketplace Module/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable UI components
│   │   └── store/         # Redux + RTK Query APIs
│   └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── middlewares/   # Auth, rate limiting
│   │   └── routes/        # API route definitions
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Test data seeder
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- npm or yarn

### Environment Variables

**Server (`server/.env`)**
```env
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5001
NODE_ENV=development
CLIENT_URL="http://localhost:3000"
```

**Client (`client/.env.local`)**
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
```

---

## Installation & Running

### 1. Clone the repository
```bash
git clone <repository-url>
cd "Marketplace Module"
```

### 2. Setup Backend
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```
Server runs at: `http://localhost:5001`

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```
Client runs at: `http://localhost:3000`

### 4. Seed Test Data (Optional)
```bash
cd server
npx prisma db seed
```



---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | Get all active listings |
| GET | `/api/listings/:id` | Get single listing |
| POST | `/api/listings` | Create listing (seller) |
| PATCH | `/api/listings/:id` | Update listing (owner) |
| DELETE | `/api/listings/:id` | Delete listing (owner) |
| GET | `/api/listings/my` | Get seller's listings |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (buyer) |
| GET | `/api/orders/buyer` | Get buyer's orders |
| GET | `/api/orders/seller` | Get seller's orders |
| PATCH | `/api/orders/:id/status` | Update order status |
| PATCH | `/api/orders/:id/quote` | Provide quote (seller) |
| DELETE | `/api/orders/:id` | Cancel order (buyer) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/listings` | Get all listings |
| GET | `/api/admin/orders` | Get all orders |
| PATCH | `/api/admin/users/:id/block` | Toggle user block |
| PATCH | `/api/admin/listings/:id/block` | Toggle listing block |

---

## Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt (12 rounds)
- Role-based access control (RBAC)
- Input validation with Zod schemas
- API rate limiting per endpoint
- Protected routes on frontend

---

## License

This project is for assessment purposes.
