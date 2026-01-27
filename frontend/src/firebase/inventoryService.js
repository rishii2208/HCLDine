// Inventory Service - Firestore operations for inventory management
import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "./config";

const INVENTORY_COLLECTION = "inventory";

/**
 * Get all inventory items
 * @returns {Promise<Object>} Inventory object {itemId: {quantity, name, ...}}
 */
export const getAllInventory = async () => {
  try {
    const snapshot = await getDocs(collection(db, INVENTORY_COLLECTION));
    const inventory = {};
    
    snapshot.forEach((doc) => {
      inventory[doc.id] = doc.data();
    });
    
    return { success: true, inventory };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return { success: false, error: error.message, inventory: {} };
  }
};

/**
 * Get inventory for a specific item
 * @param {string} itemId - Item ID
 * @returns {Promise<Object>} Inventory data
 */
export const getItemInventory = async (itemId) => {
  try {
    const docRef = doc(db, INVENTORY_COLLECTION, itemId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, ...docSnap.data() };
    }
    return { success: false, error: "Item not found", quantity: 0 };
  } catch (error) {
    console.error("Error fetching item inventory:", error);
    return { success: false, error: error.message, quantity: 0 };
  }
};

/**
 * Decrement inventory for multiple items when order is placed
 * @param {Array} items - Array of {itemId, quantity}
 * @returns {Promise<Object>} Result
 */
export const decrementInventory = async (items) => {
  try {
    const batch = writeBatch(db);
    
    for (const item of items) {
      const docRef = doc(db, INVENTORY_COLLECTION, item.itemId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentQty = docSnap.data().quantity || 0;
        const newQty = Math.max(0, currentQty - item.quantity);
        
        batch.update(docRef, {
          quantity: newQty,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error decrementing inventory:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if items are available in inventory
 * @param {Array} items - Array of {itemId, quantity}
 * @returns {Promise<Object>} Result with availability info
 */
export const checkAvailability = async (items) => {
  try {
    const unavailable = [];
    
    for (const item of items) {
      const docRef = doc(db, INVENTORY_COLLECTION, item.itemId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        unavailable.push({ ...item, available: 0, reason: "Not found" });
      } else {
        const available = docSnap.data().quantity || 0;
        if (available < item.quantity) {
          unavailable.push({ ...item, available, reason: "Insufficient stock" });
        }
      }
    }
    
    return {
      success: unavailable.length === 0,
      unavailable,
      message: unavailable.length > 0 ? "Some items are not available" : "All items available"
    };
  } catch (error) {
    console.error("Error checking availability:", error);
    return { success: false, error: error.message };
  }
};
