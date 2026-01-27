// Inventory API Routes
import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();
const INVENTORY_COLLECTION = "inventory";

/**
 * GET /api/inventory
 * Get all inventory items
 */
router.get("/", async (req, res, next) => {
  try {
    const snapshot = await db.collection(INVENTORY_COLLECTION).get();
    const inventory = {};
    
    snapshot.forEach((doc) => {
      inventory[doc.id] = doc.data();
    });
    
    res.json({ success: true, inventory });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/inventory/:itemId
 * Get inventory for specific item
 */
router.get("/:itemId", async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const doc = await db.collection(INVENTORY_COLLECTION).doc(itemId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Item not found in inventory" });
    }
    
    res.json({ success: true, itemId, ...doc.data() });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/inventory/:itemId (Admin)
 * Update inventory quantity
 */
router.put("/:itemId", async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (typeof quantity !== "number" || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be a non-negative number"
      });
    }
    
    await db.collection(INVENTORY_COLLECTION).doc(itemId).set({
      quantity,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    res.json({ success: true, message: "Inventory updated" });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/inventory/decrement
 * Decrement inventory for multiple items (used when order is placed)
 */
router.post("/decrement", async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { itemId, quantity }
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Items array is required"
      });
    }
    
    const batch = db.batch();
    const errors = [];
    
    // Check availability first
    for (const item of items) {
      const doc = await db.collection(INVENTORY_COLLECTION).doc(item.itemId).get();
      
      if (!doc.exists) {
        errors.push(`Item ${item.itemId} not found in inventory`);
        continue;
      }
      
      const currentQty = doc.data().quantity || 0;
      if (currentQty < item.quantity) {
        errors.push(`Insufficient stock for item ${item.itemId}. Available: ${currentQty}, Requested: ${item.quantity}`);
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
    
    // Decrement quantities
    for (const item of items) {
      const docRef = db.collection(INVENTORY_COLLECTION).doc(item.itemId);
      const doc = await docRef.get();
      const currentQty = doc.data().quantity || 0;
      
      batch.update(docRef, {
        quantity: currentQty - item.quantity,
        updatedAt: new Date().toISOString()
      });
    }
    
    await batch.commit();
    
    res.json({ success: true, message: "Inventory decremented successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
