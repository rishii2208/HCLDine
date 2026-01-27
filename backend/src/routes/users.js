// Users API Routes
import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get("/profile", async (req, res, next) => {
  try {
    const { uid } = req.user;
    
    const doc = await db.collection("users").doc(uid).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }
    
    res.json({ success: true, profile: doc.data() });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put("/profile", async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { displayName, phone, address } = req.body;
    
    const updates = {
      updatedAt: new Date().toISOString()
    };
    
    if (displayName) updates.displayName = displayName;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    
    await db.collection("users").doc(uid).set(updates, { merge: true });
    
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/cart
 * Get user's cart
 */
router.get("/cart", async (req, res, next) => {
  try {
    const { uid } = req.user;
    
    const doc = await db.collection("users").doc(uid).collection("cart").doc("items").get();
    
    const cart = doc.exists ? doc.data() : {};
    
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/cart
 * Update user's cart
 */
router.put("/cart", async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { cart } = req.body;
    
    if (typeof cart !== "object") {
      return res.status(400).json({
        success: false,
        error: "Cart must be an object"
      });
    }
    
    await db.collection("users").doc(uid).collection("cart").doc("items").set(cart);
    
    res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/cart
 * Clear user's cart
 */
router.delete("/cart", async (req, res, next) => {
  try {
    const { uid } = req.user;
    
    await db.collection("users").doc(uid).collection("cart").doc("items").delete();
    
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
});

export default router;
