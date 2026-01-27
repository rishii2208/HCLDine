# HCLDine Backend

Express.js backend with Firebase Admin SDK for HCLDine Food App.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Firebase Admin SDK:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project: `hcltech-a78ba`
   - Navigate to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the file as `serviceAccountKey.json` in the backend folder

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

4. **Seed the database (optional):**

   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Menu (Public)

- `GET /api/menu` - Get all menu items
- `GET /api/menu?category=Salad` - Filter by category
- `GET /api/menu/categories` - Get all categories
- `GET /api/menu/:id` - Get single item

### Menu (Admin)

- `POST /api/menu` - Add menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item
- `PATCH /api/menu/:id/stock` - Update stock status

### Orders (Authenticated)

- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/cancel` - Cancel order

### Users (Authenticated)

- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/cart` - Get cart
- `PUT /api/users/cart` - Update cart
- `DELETE /api/users/cart` - Clear cart

## Authentication

Protected routes require Firebase ID Token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.js      # Firebase Admin setup
│   ├── middleware/
│   │   └── auth.js          # Token verification
│   ├── routes/
│   │   ├── menu.js          # Menu endpoints
│   │   ├── orders.js        # Order endpoints
│   │   └── users.js         # User endpoints
│   ├── scripts/
│   │   └── seedData.js      # Database seeder
│   └── index.js             # Express server
├── firestore.rules          # Firestore security rules
├── package.json
├── .env
└── serviceAccountKey.json   # (gitignored) Firebase credentials
```
