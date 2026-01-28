# HCLDine - Food Ordering Application

A full-stack food ordering platform built with React, Node.js, Express, and Firebase. Features real-time inventory management, secure authentication, email notifications, and a seamless ordering experience.

[![Frontend Deploy](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://hcl-dine.vercel.app)
[![Backend Deploy](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://backend.onrender.com)
[![Firebase](https://img.shields.io/badge/Database-Firestore-orange?logo=firebase)](https://firebase.google.com)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Database Structure](#database-structure)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Customer Features
- Browse menu items by categories
- Real-time inventory status with "SOLD OUT" indicators
- Add/remove items from cart with quantity management
- Secure user authentication (Email/Password)
- Place orders with delivery information
- View order history with status tracking
- Email confirmation for orders
- Persistent cart across sessions

### Admin Features (Future Enhancement)
- Manage menu items (CRUD operations)
- Update inventory levels
- Track order statuses
- View all orders

### Security Features
- API key authentication for all endpoints
- Firebase token-based user authentication
- CORS protection
- Secure password hashing
- Protected routes

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HCLDINE ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐         ┌──────────────┐         ┌──────────────────┐   │
│   │   FRONTEND   │  ──────▶│   BACKEND    │  ──────▶│    FIREBASE      │   │
│   │   (Vercel)   │◀──────  │   (Render)   │◀──────  │   (Google)       │   │
│   │              │         │              │         │                  │   │
│   │  React 19    │         │  Express.js  │         │  - Firestore DB  │   │
│   │  Vite        │         │  Node.js     │         │  - Auth          │   │
│   │              │         │  Nodemailer  │         │                  │   │
│   └──────────────┘         └──────────────┘         └──────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│                            ┌──────────────┐                                 │
│                            │    GMAIL     │                                 │
│                            │    SMTP      │                                 │
│                            │  (Emails)    │                                 │
│                            └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Request Flow
```
User Action → Frontend (React) → API Client → Backend (Express) → Firebase/Email
     ↓                                                                   ↓
  UI Update ←────────────────────── Response ←──────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| Vite | Latest | Build tool & dev server |
| React Router | 7.x | Client-side routing |
| Firebase Client SDK | 11.x | Authentication & Firestore access |
| CSS3 | - | Styling (no framework) |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x | Runtime environment |
| Express.js | 4.x | Web framework |
| Firebase Admin SDK | 13.x | Server-side Firebase access |
| Nodemailer | 6.x | Email sending |
| dotenv | 16.x | Environment variables |
| cors | 2.x | Cross-origin resource sharing |

### Database & Services
| Service | Purpose |
|---------|---------|
| Firebase Firestore | NoSQL database |
| Firebase Auth | User authentication |
| Gmail SMTP | Email notifications |

---

## Database Structure

### Firestore Collections

```
firestore/
├── users/                          # User profiles
│   └── {userId}/
│       ├── displayName: string
│       ├── email: string
│       ├── cart/                   # Subcollection
│       │   └── items/
│       │       └── items: array
│       └── orders/                 # Subcollection references
│
├── menu/                           # Food items (32 items)
│   └── {itemId}/
│       ├── _id: string
│       ├── name: string
│       ├── price: number
│       ├── description: string
│       ├── category: string
│       └── image: string (URL)
│
├── categories/                     # Menu categories (8 categories)
│   └── {categoryId}/
│       ├── name: string
│       ├── image: string (URL)
│       └── order: number
│
├── inventory/                      # Stock management
│   └── {itemId}/
│       ├── quantity: number (default: 100)
│       ├── name: string
│       └── updatedAt: timestamp
│
└── orders/                         # All orders
    └── {orderId}/
        ├── userId: string
        ├── items: array
        │   └── [{itemId, name, price, quantity, image}]
        ├── deliveryInfo: object
        │   ├── firstName: string
        │   ├── lastName: string
        │   ├── email: string
        │   ├── street: string
        │   ├── city: string
        │   ├── state: string
        │   ├── zipcode: string
        │   └── phone: string
        ├── subtotal: number
        ├── deliveryFee: number
        ├── total: number
        ├── status: string (confirmed, preparing, out-for-delivery, delivered)
        ├── orderDate: string
        └── createdAt: timestamp
```

---

## API Endpoints

Base URL: `https://your-backend.onrender.com`

### Public Endpoint
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | ❌ |

### Menu Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/menu` | Get all menu items | API Key |
| GET | `/api/menu/categories` | Get all categories | API Key |
| GET | `/api/menu/:id` | Get single menu item | API Key |
| POST | `/api/menu` | Add new menu item | API Key |
| PUT | `/api/menu/:id` | Update menu item | API Key |
| DELETE | `/api/menu/:id` | Delete menu item | API Key |
| PATCH | `/api/menu/:id/stock` | Update stock status | API Key |

### Inventory Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/inventory` | Get all inventory | API Key |
| GET | `/api/inventory/:itemId` | Get item stock | API Key |
| PUT | `/api/inventory/:itemId` | Update stock level | API Key |
| POST | `/api/inventory/decrement` | Decrement stock on order | API Key |

### Order Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders` | Get user's orders | API Key + Token |
| GET | `/api/orders/:id` | Get specific order | API Key + Token |
| POST | `/api/orders` | Place new order | API Key + Token |
| PATCH | `/api/orders/:id/cancel` | Cancel order | API Key + Token |
| PATCH | `/api/orders/:id/status` | Update order status | API Key + Token |

### User Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | API Key + Token |
| PUT | `/api/users/profile` | Update user profile | API Key + Token |
| GET | `/api/users/cart` | Get user's cart | API Key + Token |
| PUT | `/api/users/cart` | Update cart | API Key + Token |
| DELETE | `/api/users/cart` | Clear cart | API Key + Token |

---

## Security

### Multi-Layer Security Model

```
Request → CORS Check → API Key Validation → Token Verification → Route Handler
```

### 1. **API Key Authentication**
All `/api/*` endpoints require the `x-api-key` header:

```http
x-api-key: your-secure-api-key
```

### 2. **Firebase Token Authentication**
User-specific endpoints require a Firebase ID token:

```http
Authorization: Bearer <firebase-id-token>
```

### 3. **CORS Protection**
Only whitelisted origins can make requests:
- `http://localhost:5173` (Development)
- `https://hcl-dine.vercel.app` (Production)
- Environment-defined URLs

### 4. **Secure Middleware Stack**

**apiKey.js**
```javascript
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: "Invalid API key" });
  }
  next();
};
```

**auth.js**
```javascript
export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  
  const decodedToken = await auth.verifyIdToken(token);
  req.user = { 
    uid: decodedToken.uid, 
    email: decodedToken.email 
  };
  next();
};
```

---

## Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase project
- Gmail account with App Password

### Clone Repository
```bash
git clone https://github.com/yourusername/hcldine.git
cd hcldine
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_API_KEY=your-api-key-here
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
EOF

npm run dev
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
API_KEY=your-secure-api-key
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
EOF

npm run dev
```

### Seed Database
```bash
cd backend
npm run seed
```

---

## Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=production
PORT=5000

# Frontend URL
FRONTEND_URL=https://hcl-dine.vercel.app

# Security
API_KEY=<generate-secure-random-key>

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT=<firebase-service-account-json>

# Email Configuration
GMAIL_USER=<your-gmail-address>
GMAIL_APP_PASSWORD=<16-char-app-password>
```

### Frontend (.env)
```env
# Backend API
VITE_API_URL=https://your-backend.onrender.com/api
VITE_API_KEY=<same-as-backend-api-key>

# Firebase Client SDK
VITE_FIREBASE_API_KEY=<firebase-web-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project-id>
VITE_FIREBASE_STORAGE_BUCKET=<project-id>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_APP_ID=<app-id>
```

### Generating Secure API Key
```bash
# Method 1: OpenSSL
openssl rand -hex 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Deployment

### Frontend - Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

```bash
# Or use Vercel CLI
npm install -g vercel
cd frontend
vercel --prod
```

### Backend - Render

1. Create new Web Service in Render
2. Connect GitHub repository
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `backend`
4. Add environment variables
5. Deploy

**render.yaml** (Optional)
```yaml
services:
  - type: web
    name: hcldine-backend
    env: node
    region: oregon
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
```

---

## Project Structure

```
FOOD-APP/
├── frontend/                          # React Application
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js              # Axios instance with API key
│   │   ├── assets/
│   │   │   ├── *.png                  # Images
│   │   │   └── assets.js              # Asset exports & food data
│   │   ├── Components/
│   │   │   ├── Navbar/
│   │   │   ├── Header/
│   │   │   ├── ExploreMenu/
│   │   │   ├── FoodDisplay/
│   │   │   ├── FoodItem/              # Shows inventory status
│   │   │   ├── Footer/
│   │   │   ├── LoginPopup/
│   │   │   └── AppDownload/
│   │   ├── Context/
│   │   │   ├── StoreContext.jsx       # Global state management
│   │   │   └── AuthContext.jsx        # Authentication state
│   │   ├── firebase/
│   │   │   ├── config.js              # Firebase initialization
│   │   │   ├── authService.js         # Auth operations
│   │   │   ├── cartService.js         # Cart CRUD
│   │   │   ├── orderService.js        # Order operations
│   │   │   ├── menuService.js         # Menu fetching
│   │   │   └── inventoryService.js    # Inventory checks
│   │   ├── Pages/
│   │   │   ├── Home/
│   │   │   ├── Cart/
│   │   │   ├── PlaceOrder/            # Order placement form
│   │   │   └── MyOrders/              # Order history
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── .env.production
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Express Server
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js            # Firebase Admin SDK
│   │   ├── middleware/
│   │   │   ├── auth.js                # Token verification
│   │   │   └── apiKey.js              # API key validation
│   │   ├── routes/
│   │   │   ├── menu.js                # Menu CRUD
│   │   │   ├── orders.js              # Order management
│   │   │   ├── users.js               # User operations
│   │   │   └── inventory.js           # Inventory management
│   │   ├── services/
│   │   │   └── emailService.js        # Nodemailer config
│   │   ├── scripts/
│   │   │   └── seedData.js            # Database seeding
│   │   └── index.js                   # Server entry point
│   ├── .env
│   ├── package.json
│   └── render.yaml
│
├── .gitignore
└── README.md
```

---

## Data Flow

### Frontend Data Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND DATA FLOW                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   IMAGES                                                            │
│   assets/*.png → assets.js → Components                             │
│                                                                     │
│   FOOD DATA                                                         │
│   assets.js (food_list) → StoreContext → FoodDisplay → FoodItem     │
│                                                                     │
│   CART DATA                                                         │
│   User action → StoreContext → cartService → Firestore              │
│                    ↑                              │                 │
│                    └──────── sync ───────────────┘                  │
│                                                                     │
│   INVENTORY                                                         │
│   Firestore → inventoryService → StoreContext → FoodItem            │
│                                                                     │
│   AUTH                                                              │
│   Firebase Auth → AuthContext → Navbar, LoginPopup, Pages           │
│                                                                     │
│   ORDERS                                                            │
│   PlaceOrder → orderService → Backend API → Firestore + Email       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Order Placement Flow
```
1. User clicks "PLACE ORDER"
   ↓
2. Frontend validates form & gets Firebase token
   ↓
3. API client adds headers (x-api-key, Authorization)
   ↓
4. POST request to /api/orders with order data
   ↓
5. Backend middleware chain:
   - CORS check ✓
   - API key validation ✓
   - Token verification ✓
   ↓
6. Order handler:
   - Create order document
   - Save to Firestore
   - Decrement inventory
   - Clear user's cart
   - Send confirmation email (async)
   ↓
7. Response sent to frontend
   ↓
8. Redirect to /myorders
```

### Inventory Management Flow
```
Initial Setup (100 qty) → Display in FoodItem → User adds to cart
                                                       ↓
                              Check availability → Place order
                                                       ↓
                              Decrement inventory ← Order confirmed
                                                       ↓
                              quantity = 0? → Show "SOLD OUT"
```

---

## Email System

### Configuration
- **Service:** Gmail SMTP
- **Port:** 587 (TLS)
- **Library:** Nodemailer

### Email Features
- Order confirmation
- Itemized order details
- Delivery address
- Total breakdown
- Contact information

### Sample Email Template
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Branded styling */
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>HCLDine</h1>
        </div>
        <div class="content">
            <h2>Order Confirmed!</h2>
            <p>Order ID: #ABC123</p>
            <table>
                <!-- Order items -->
            </table>
            <div class="total">
                <p>Total: ₹500</p>
            </div>
        </div>
        <div class="footer">
            <p>Thank you for ordering!</p>
        </div>
    </div>
</body>
</html>
```

---

## Testing

### Manual Testing Checklist
- [ ] User registration/login
- [ ] Browse menu items
- [ ] Add/remove items from cart
- [ ] Check sold out items are disabled
- [ ] Place order with valid details
- [ ] Receive email confirmation
- [ ] View order history
- [ ] Check inventory decrements

### API Testing with cURL
```bash
# Health check
curl http://localhost:5000/health

# Get menu (with API key)
curl -H "x-api-key: your-key" \
     http://localhost:5000/api/menu

# Place order (with API key and token)
curl -X POST \
     -H "x-api-key: your-key" \
     -H "Authorization: Bearer your-firebase-token" \
     -H "Content-Type: application/json" \
     -d '{"items":[...],"deliveryInfo":{...},"total":500}' \
     http://localhost:5000/api/orders
```

---

## Troubleshooting

### Common Issues

**Issue:** CORS errors
```
Solution: Verify FRONTEND_URL in backend .env matches your frontend URL
```

**Issue:** API key invalid
```
Solution: Ensure API_KEY matches in both frontend and backend .env files
```

**Issue:** Firebase token expired
```
Solution: Re-login to get a new token (tokens expire after 1 hour)
```

**Issue:** Email not sending
```
Solution: 
1. Enable "Less secure app access" in Gmail (if available)
2. Generate App Password: Google Account → Security → 2-Step Verification → App Passwords
3. Use the 16-character app password in GMAIL_APP_PASSWORD
```

**Issue:** Inventory not updating
```
Solution: Check Firestore rules allow write access to /inventory collection
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style Guidelines
- Use ES6+ syntax
- Follow Airbnb JavaScript Style Guide
- Add comments for complex logic
- Write descriptive commit messages

---

## License

This project will be licensed under the MIT License - .

---

## Authors

- **Rishi**
- **Honey**
- **Tanvi**
- **Nikhil**
---

## Acknowledgments

- React team for the amazing framework
- Firebase for backend services
- Vercel and Render for hosting
- Nodemailer for email functionality

---

## Support

For support, email rishirajprajapati22@gmail.com or create an issue in this repository.

---

## Future Enhancements

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Real-time order tracking with Google Maps
- [ ] Admin dashboard for order management
- [ ] Push notifications for order updates
- [ ] Multi-restaurant support
- [ ] Loyalty program and coupons
- [ ] Rating and review system
- [ ] Advanced search and filters
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard

---

<div align="center">

**Made with care by the HCLDine Team**

[Website](https://hcl-dine.vercel.app) • [Report Bug](https://github.com/yourusername/hcldine/issues) • [Request Feature](https://github.com/yourusername/hcldine/issues)

</div>
