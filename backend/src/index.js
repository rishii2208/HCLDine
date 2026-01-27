// Express Server Entry Point
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/orders.js";
import userRoutes from "./routes/users.js";
import inventoryRoutes from "./routes/inventory.js";
import { verifyToken } from "./middleware/auth.js";
import { validateApiKey } from "./middleware/apiKey.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Health check (public - no API key required)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Apply API key validation to all /api routes
app.use("/api", validateApiKey);

// API Routes (all secured with x-api-key header)
app.use("/api/menu", menuRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", verifyToken, orderRoutes);
app.use("/api/users", verifyToken, userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`� All /api/* endpoints secured with x-api-key header`);
  console.log(`📚 API endpoints (21 total):`);
  console.log(`   GET  /health - Health check (public)`);
  console.log(`   ---- Menu Endpoints (7) ----`);
  console.log(`   GET  /api/menu - Get all menu items`);
  console.log(`   GET  /api/menu/categories - Get categories`);
  console.log(`   GET  /api/menu/:id - Get menu item by ID`);
  console.log(`   POST /api/menu - Add menu item (admin)`);
  console.log(`   PUT  /api/menu/:id - Update menu item (admin)`);
  console.log(`   DELETE /api/menu/:id - Delete menu item (admin)`);
  console.log(`   PATCH /api/menu/:id/stock - Update stock status (admin)`);
  console.log(`   ---- Inventory Endpoints (4) ----`);
  console.log(`   GET  /api/inventory - Get all inventory`);
  console.log(`   GET  /api/inventory/:itemId - Get item inventory`);
  console.log(`   PUT  /api/inventory/:itemId - Update inventory (admin)`);
  console.log(`   POST /api/inventory/decrement - Decrement inventory`);
  console.log(`   ---- Order Endpoints (5) ----`);
  console.log(`   GET  /api/orders - Get user orders`);
  console.log(`   GET  /api/orders/:id - Get order by ID`);
  console.log(`   POST /api/orders - Create new order`);
  console.log(`   PATCH /api/orders/:id/cancel - Cancel order`);
  console.log(`   PATCH /api/orders/:id/status - Update status (admin)`);
  console.log(`   ---- User Endpoints (5) ----`);
  console.log(`   GET  /api/users/profile - Get user profile`);
  console.log(`   PUT  /api/users/profile - Update user profile`);
  console.log(`   GET  /api/users/cart - Get user cart`);
  console.log(`   PUT  /api/users/cart - Update user cart`);
  console.log(`   DELETE /api/users/cart - Clear user cart`);
});

export default app;
