// Menu API Routes
import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();
const MENU_COLLECTION = "menu";
const CATEGORIES_COLLECTION = "categories";

/**
 * GET /api/menu
 * Get all menu items (optionally filter by category)
 */
router.get("/", async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = db.collection(MENU_COLLECTION);
    
    if (category) {
      query = query.where("category", "==", category);
    }
    
    const snapshot = await query.get();
    const items = [];
    
    snapshot.forEach((doc) => {
      items.push({ _id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, items, count: items.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/menu/categories
 * Get all menu categories
 */
router.get("/categories", async (req, res, next) => {
  try {
    const snapshot = await db.collection(CATEGORIES_COLLECTION).orderBy("order").get();
    const categories = [];
    
    snapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, categories, count: categories.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/menu/:id
 * Get a single menu item by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection(MENU_COLLECTION).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    
    res.json({ success: true, item: { _id: doc.id, ...doc.data() } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/menu (Admin only - add validation)
 * Add a new menu item
 */
router.post("/", async (req, res, next) => {
  try {
    const { name, price, description, category, image, inStock = true } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        error: "Name, price, and category are required"
      });
    }
    
    const docRef = await db.collection(MENU_COLLECTION).add({
      name,
      price: Number(price),
      description: description || "",
      category,
      image: image || "",
      inStock,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/menu/:id (Admin only)
 * Update a menu item
 */
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const docRef = db.collection(MENU_COLLECTION).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    
    await docRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ success: true, message: "Item updated" });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/menu/:id (Admin only)
 * Delete a menu item
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const docRef = db.collection(MENU_COLLECTION).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    
    await docRef.delete();
    
    res.json({ success: true, message: "Item deleted" });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/menu/:id/stock (Admin only)
 * Update item stock status
 */
router.patch("/:id/stock", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { inStock } = req.body;
    
    if (typeof inStock !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "inStock must be a boolean"
      });
    }
    
    await db.collection(MENU_COLLECTION).doc(id).update({
      inStock,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ success: true, message: `Item marked as ${inStock ? "in stock" : "out of stock"}` });
  } catch (error) {
    next(error);
  }
});

export default router;
