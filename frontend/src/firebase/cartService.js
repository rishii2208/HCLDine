// Cart Service - Firestore operations for user cart
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField
} from "firebase/firestore";
import { db } from "./config";

/**
 * Get user's cart from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Cart items object
 */
export const getCart = async (userId) => {
  try {
    const cartRef = doc(db, "users", userId, "cart", "items");
    const cartSnap = await getDoc(cartRef);
    
    if (cartSnap.exists()) {
      return { success: true, cart: cartSnap.data() };
    }
    return { success: true, cart: {} };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return { success: false, error: error.message, cart: {} };
  }
};

/**
 * Save entire cart to Firestore
 * @param {string} userId - User ID
 * @param {Object} cartItems - Cart items object
 * @returns {Promise<Object>} Result
 */
export const saveCart = async (userId, cartItems) => {
  try {
    const cartRef = doc(db, "users", userId, "cart", "items");
    await setDoc(cartRef, cartItems);
    return { success: true };
  } catch (error) {
    console.error("Error saving cart:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Add item to cart or increment quantity
 * @param {string} userId - User ID
 * @param {string} itemId - Item ID
 * @param {number} quantity - Quantity to add (default 1)
 * @returns {Promise<Object>} Result
 */
export const addToCart = async (userId, itemId, quantity = 1) => {
  try {
    const cartRef = doc(db, "users", userId, "cart", "items");
    const cartSnap = await getDoc(cartRef);
    
    if (cartSnap.exists()) {
      const currentQty = cartSnap.data()[itemId] || 0;
      await updateDoc(cartRef, {
        [itemId]: currentQty + quantity
      });
    } else {
      await setDoc(cartRef, { [itemId]: quantity });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove item from cart or decrement quantity
 * @param {string} userId - User ID
 * @param {string} itemId - Item ID
 * @returns {Promise<Object>} Result with updated quantity
 */
export const removeFromCart = async (userId, itemId) => {
  try {
    const cartRef = doc(db, "users", userId, "cart", "items");
    const cartSnap = await getDoc(cartRef);
    
    if (cartSnap.exists()) {
      const currentQty = cartSnap.data()[itemId] || 0;
      
      if (currentQty <= 1) {
        // Remove item completely
        await updateDoc(cartRef, {
          [itemId]: deleteField()
        });
        return { success: true, newQuantity: 0 };
      } else {
        // Decrement quantity
        await updateDoc(cartRef, {
          [itemId]: currentQty - 1
        });
        return { success: true, newQuantity: currentQty - 1 };
      }
    }
    
    return { success: true, newQuantity: 0 };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update item quantity in cart
 * @param {string} userId - User ID
 * @param {string} itemId - Item ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Result
 */
export const updateCartItemQuantity = async (userId, itemId, quantity) => {
  try {
    const cartRef = doc(db, "users", userId, "cart", "items");
    
    if (quantity <= 0) {
      await updateDoc(cartRef, {
        [itemId]: deleteField()
      });
    } else {
      await updateDoc(cartRef, {
        [itemId]: quantity
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear entire cart
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result
 */
export const clearCart = async (userId) => {
  try {
    const cartRef = doc(db, "users", userId, "cart", "items");
    await deleteDoc(cartRef);
    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculate cart total
 * @param {Object} cartItems - Cart items object {itemId: quantity}
 * @param {Array} menuItems - Array of menu items
 * @returns {number} Total amount
 */
export const calculateCartTotal = (cartItems, menuItems) => {
  let total = 0;
  
  for (const [itemId, quantity] of Object.entries(cartItems)) {
    if (quantity > 0) {
      const item = menuItems.find((product) => product._id === itemId);
      if (item) {
        total += item.price * quantity;
      }
    }
  }
  
  return total;
};
