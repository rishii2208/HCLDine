// Menu Service - Firestore operations for menu items
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "./config";

const MENU_COLLECTION = "menu";
const CATEGORIES_COLLECTION = "categories";

/**
 * Get all menu items
 * @returns {Promise<Array>} Array of menu items
 */
export const getAllMenuItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, MENU_COLLECTION));
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ _id: doc.id, ...doc.data() });
    });
    return { success: true, items };
  } catch (error) {
    console.error("Error fetching menu:", error);
    return { success: false, error: error.message, items: [] };
  }
};

/**
 * Get menu items by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of menu items
 */
export const getMenuItemsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, MENU_COLLECTION),
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ _id: doc.id, ...doc.data() });
    });
    return { success: true, items };
  } catch (error) {
    console.error("Error fetching menu by category:", error);
    return { success: false, error: error.message, items: [] };
  }
};

/**
 * Get a single menu item by ID
 * @param {string} itemId - Item ID
 * @returns {Promise<Object>} Menu item
 */
export const getMenuItem = async (itemId) => {
  try {
    const docRef = doc(db, MENU_COLLECTION, itemId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, item: { _id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: "Item not found" };
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Add a new menu item (Admin function)
 * @param {Object} itemData - Menu item data
 * @returns {Promise<Object>} Result
 */
export const addMenuItem = async (itemData) => {
  try {
    const docRef = doc(collection(db, MENU_COLLECTION));
    await setDoc(docRef, {
      ...itemData,
      inStock: itemData.inStock ?? true,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding menu item:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a menu item (Admin function)
 * @param {string} itemId - Item ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Result
 */
export const updateMenuItem = async (itemId, updates) => {
  try {
    const docRef = doc(db, MENU_COLLECTION, itemId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating menu item:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a menu item (Admin function)
 * @param {string} itemId - Item ID
 * @returns {Promise<Object>} Result
 */
export const deleteMenuItem = async (itemId) => {
  try {
    await deleteDoc(doc(db, MENU_COLLECTION, itemId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update item stock status
 * @param {string} itemId - Item ID
 * @param {boolean} inStock - Stock status
 * @returns {Promise<Object>} Result
 */
export const updateItemStock = async (itemId, inStock) => {
  return updateMenuItem(itemId, { inStock });
};

/**
 * Get all categories
 * @returns {Promise<Array>} Array of categories
 */
export const getAllCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    const categories = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: error.message, categories: [] };
  }
};

/**
 * Seed menu data to Firestore (one-time use)
 * @param {Array} foodList - Array of food items
 * @returns {Promise<Object>} Result
 */
export const seedMenuData = async (foodList) => {
  try {
    const batch = [];
    for (const item of foodList) {
      const docRef = doc(db, MENU_COLLECTION, item._id);
      batch.push(
        setDoc(docRef, {
          name: item.name,
          price: item.price,
          description: item.description,
          category: item.category,
          imageKey: `food_${item._id}`, // Reference to local image
          inStock: true,
          createdAt: new Date().toISOString()
        })
      );
    }
    await Promise.all(batch);
    return { success: true, count: foodList.length };
  } catch (error) {
    console.error("Error seeding menu data:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Seed categories to Firestore (one-time use)
 * @param {Array} menuList - Array of categories
 * @returns {Promise<Object>} Result
 */
export const seedCategories = async (menuList) => {
  try {
    const batch = [];
    menuList.forEach((cat, index) => {
      const docRef = doc(db, CATEGORIES_COLLECTION, `cat_${index + 1}`);
      batch.push(
        setDoc(docRef, {
          menu_name: cat.menu_name,
          imageKey: `menu_${index + 1}`,
          order: index
        })
      );
    });
    await Promise.all(batch);
    return { success: true, count: menuList.length };
  } catch (error) {
    console.error("Error seeding categories:", error);
    return { success: false, error: error.message };
  }
};
