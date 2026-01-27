# HCLDine Frontend

React + Vite frontend for HCLDine Food App with Firebase Authentication.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Features

- 🔐 Firebase Authentication (Sign up / Login / Logout)
- 🛒 Shopping Cart (synced to Firestore)
- 📦 Order Placement
- 📜 Order History
- 🍕 Menu browsing by category

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── assets/           # Images and static data
│   ├── Components/       # Reusable UI components
│   │   ├── AppDownload/
│   │   ├── ExploreMenu/
│   │   ├── FoodDisplay/
│   │   ├── FoodItem/
│   │   ├── Footer/
│   │   ├── Header/
│   │   ├── LoginPopup/
│   │   └── Navbar/
│   ├── Context/
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── StoreContext.jsx   # Cart & menu state
│   ├── firebase/              # Firebase client SDK
│   │   ├── config.js
│   │   ├── authService.js
│   │   ├── cartService.js
│   │   ├── menuService.js
│   │   └── orderService.js
│   ├── Pages/
│   │   ├── Cart/
│   │   ├── Home/
│   │   ├── MyOrders/
│   │   └── PlaceOrder/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Environment Variables

Create a `.env` file (optional, for backend API):

```
VITE_API_URL=http://localhost:5000/api
```

## Deployment

Build the production bundle:

```bash
npm run build
```

The `dist/` folder can be deployed to:

- Firebase Hosting
- Vercel
- Netlify
- Any static hosting
