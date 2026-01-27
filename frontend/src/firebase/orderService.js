// Order Service - Firestore operations for orders
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "./config";
import { clearCart } from "./cartService";
import { decrementInventory } from "./inventoryService";
import { apiPost } from "../api/client";

const ORDERS_COLLECTION = "orders";

/**
 * Place a new order (uses backend API to also send confirmation email)
 * @param {string} userId - User ID
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Result with order ID
 */
export const placeOrder = async (userId, orderData) => {
  try {
    const { items, deliveryInfo, subtotal, deliveryFee, total } = orderData;

    // Get Firebase auth token for API authentication
    const user = auth.currentUser;
    let authToken = null;
    if (user) {
      authToken = await user.getIdToken();
    }

    // Try to use backend API (which sends email confirmation)
    try {
      const apiResult = await apiPost("/orders", {
        items,
        deliveryInfo,
        subtotal,
        deliveryFee,
        total
      }, authToken);

      if (apiResult.success) {
        // Clear cart locally as well
        await clearCart(userId);
        return { success: true, orderId: apiResult.orderId };
      }
    } catch (apiError) {
      console.log("Backend API unavailable, falling back to direct Firestore:", apiError.message);
    }

    // Fallback: Direct Firestore if backend is not available
    const orderDoc = {
      userId,
      items,
      deliveryInfo: {
        firstName: deliveryInfo.firstName,
        lastName: deliveryInfo.lastName,
        email: deliveryInfo.email,
        street: deliveryInfo.street,
        city: deliveryInfo.city,
        state: deliveryInfo.state,
        zipCode: deliveryInfo.zipCode,
        country: deliveryInfo.country,
        phone: deliveryInfo.phone
      },
      subtotal,
      deliveryFee,
      total,
      status: "confirmed",
      paymentStatus: "paid",
      orderDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderDoc);

    // Decrement inventory for ordered items
    const inventoryItems = items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity
    }));
    await decrementInventory(inventoryItems);

    // Add reference to user's orders subcollection
    await addDoc(collection(db, "users", userId, "orders"), {
      orderId: docRef.id,
      total,
      status: "confirmed",
      createdAt: serverTimestamp()
    });

    // Clear the user's cart
    await clearCart(userId);

    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error("Error placing order:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order data
 */
export const getOrder = async (orderId) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      return { success: true, order: { id: orderSnap.id, ...orderSnap.data() } };
    }
    return { success: false, error: "Order not found" };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all orders for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of orders
 */
export const getUserOrders = async (userId) => {
  try {
    // Simple query without orderBy to avoid index requirement
    // We'll sort client-side instead
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({ 
        id: doc.id, 
        ...data,
        // Normalize timestamp for sorting
        createdAt: data.createdAt
      });
    });
    
    // Sort by createdAt descending (newest first) on client side
    orders.sort((a, b) => {
      const dateA = a.orderDate || a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.orderDate || b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return new Date(dateB) - new Date(dateA);
    });
    
    console.log("Fetched orders:", orders.length); // Debug log
    
    return { success: true, orders };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { success: false, error: error.message, orders: [] };
  }
};

/**
 * Update order status (Admin function)
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Result
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const validStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
    
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid status" };
    }

    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update payment status
 * @param {string} orderId - Order ID
 * @param {string} paymentStatus - Payment status
 * @returns {Promise<Object>} Result
 */
export const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    const validStatuses = ["pending", "paid", "failed"];
    
    if (!validStatuses.includes(paymentStatus)) {
      return { success: false, error: "Invalid payment status" };
    }

    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      paymentStatus,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (for verification)
 * @returns {Promise<Object>} Result
 */
export const cancelOrder = async (orderId, userId) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return { success: false, error: "Order not found" };
    }

    const orderData = orderSnap.data();

    // Verify order belongs to user
    if (orderData.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Only allow cancellation of pending orders
    if (orderData.status !== "pending") {
      return { success: false, error: "Cannot cancel order that is already being processed" };
    }

    await updateDoc(orderRef, {
      status: "cancelled",
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all orders (Admin function)
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} Array of orders
 */
export const getAllOrders = async (status = null) => {
  try {
    let q;
    
    if (status) {
      q = query(
        collection(db, ORDERS_COLLECTION),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, ORDERS_COLLECTION),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, orders };
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return { success: false, error: error.message, orders: [] };
  }
};
