// Orders API Routes
import express from "express";
import { db } from "../config/firebase.js";
import admin from "firebase-admin";
import { sendOrderConfirmationEmail } from "../services/emailService.js";

const router = express.Router();
const ORDERS_COLLECTION = "orders";
const INVENTORY_COLLECTION = "inventory";

/**
 * Helper function to decrement inventory
 */
async function decrementInventory(items) {
  const batch = db.batch();
  
  for (const item of items) {
    const docRef = db.collection(INVENTORY_COLLECTION).doc(item.itemId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const currentQty = doc.data().quantity || 0;
      const newQty = Math.max(0, currentQty - item.quantity);
      
      batch.update(docRef, {
        quantity: newQty,
        updatedAt: new Date().toISOString()
      });
    }
  }
  
  await batch.commit();
}

/**
 * GET /api/orders
 * Get all orders for the authenticated user
 */
router.get("/", async (req, res, next) => {
  try {
    const { uid } = req.user;
    
    const snapshot = await db.collection(ORDERS_COLLECTION)
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();
    
    const orders = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });
    
    res.json({ success: true, orders, count: orders.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/:id
 * Get a specific order by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    
    const doc = await db.collection(ORDERS_COLLECTION).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    
    const order = doc.data();
    
    // Verify order belongs to user
    if (order.userId !== uid) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    
    res.json({
      success: true,
      order: {
        id: doc.id,
        ...order,
        createdAt: order.createdAt?.toDate?.() || order.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/orders
 * Create a new order
 */
router.post("/", async (req, res, next) => {
  try {
    const { uid, email } = req.user;
    const { items, deliveryInfo, subtotal, deliveryFee, total } = req.body;
    
    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Order must contain at least one item"
      });
    }
    
    if (!deliveryInfo || !deliveryInfo.firstName || !deliveryInfo.phone) {
      return res.status(400).json({
        success: false,
        error: "Delivery information is required"
      });
    }
    
    // Create order document
    const orderDoc = {
      userId: uid,
      userEmail: email,
      items,
      deliveryInfo: {
        firstName: deliveryInfo.firstName,
        lastName: deliveryInfo.lastName || "",
        email: deliveryInfo.email || email,
        street: deliveryInfo.street || "",
        city: deliveryInfo.city || "",
        state: deliveryInfo.state || "",
        zipCode: deliveryInfo.zipCode || "",
        country: deliveryInfo.country || "",
        phone: deliveryInfo.phone
      },
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee) || 2,
      total: Number(total) || 0,
      status: "confirmed",
      paymentStatus: "paid",
      orderDate: new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Add order
    const docRef = await db.collection(ORDERS_COLLECTION).add(orderDoc);
    
    // Decrement inventory for ordered items
    await decrementInventory(items);
    
    // Add to user's orders subcollection
    await db.collection("users").doc(uid).collection("orders").add({
      orderId: docRef.id,
      total: orderDoc.total,
      status: "confirmed",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Clear user's cart
    await db.collection("users").doc(uid).collection("cart").doc("items").delete();
    
    // Send order confirmation email
    const emailOrder = {
      orderId: docRef.id,
      items: orderDoc.items,
      deliveryInfo: orderDoc.deliveryInfo,
      subtotal: orderDoc.subtotal,
      deliveryFee: orderDoc.deliveryFee,
      total: orderDoc.total,
      status: orderDoc.status,
      orderDate: orderDoc.orderDate,
      userEmail: email
    };
    
    // Send email asynchronously (don't wait for it)
    sendOrderConfirmationEmail(emailOrder)
      .then(result => {
        if (result.success) {
          console.log(`📧 Order confirmation email sent for order ${docRef.id}`);
        }
      })
      .catch(err => console.error("Email error:", err));
    
    res.status(201).json({
      success: true,
      orderId: docRef.id,
      message: "Order placed successfully"
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/orders/:id/cancel
 * Cancel an order (only if pending)
 */
router.patch("/:id/cancel", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    
    const docRef = db.collection(ORDERS_COLLECTION).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    
    const order = doc.data();
    
    if (order.userId !== uid) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Cannot cancel order that is already being processed"
      });
    }
    
    await docRef.update({
      status: "cancelled",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: "Order cancelled" });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/orders/:id/status (Admin only)
 * Update order status
 */
router.patch("/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }
    
    await db.collection(ORDERS_COLLECTION).doc(id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    next(error);
  }
});

export default router;
