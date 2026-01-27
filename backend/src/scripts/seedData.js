// Database Seeding Script
// Run with: npm run seed

import { db } from "../config/firebase.js";

const MENU_COLLECTION = "menu";
const CATEGORIES_COLLECTION = "categories";
const INVENTORY_COLLECTION = "inventory";

// Default inventory quantity for each item
const DEFAULT_INVENTORY_QUANTITY = 100;

// Menu categories
const categories = [
  { menu_name: "Salad", imageKey: "menu_1", order: 0 },
  { menu_name: "Rolls", imageKey: "menu_2", order: 1 },
  { menu_name: "Deserts", imageKey: "menu_3", order: 2 },
  { menu_name: "Sandwich", imageKey: "menu_4", order: 3 },
  { menu_name: "Cake", imageKey: "menu_5", order: 4 },
  { menu_name: "Pure Veg", imageKey: "menu_6", order: 5 },
  { menu_name: "Pasta", imageKey: "menu_7", order: 6 },
  { menu_name: "Noodles", imageKey: "menu_8", order: 7 }
];

// Food items
const foodItems = [
  { _id: "1", name: "Greek salad", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Salad" },
  { _id: "2", name: "Veg salad", price: 18, description: "Food provides essential nutrients for overall health and well-being", category: "Salad" },
  { _id: "3", name: "Clover Salad", price: 16, description: "Food provides essential nutrients for overall health and well-being", category: "Salad" },
  { _id: "4", name: "Chicken Salad", price: 24, description: "Food provides essential nutrients for overall health and well-being", category: "Salad" },
  { _id: "5", name: "Lasagna Rolls", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls" },
  { _id: "6", name: "Peri Peri Rolls", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls" },
  { _id: "7", name: "Chicken Rolls", price: 20, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls" },
  { _id: "8", name: "Veg Rolls", price: 15, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls" },
  { _id: "9", name: "Ripple Ice Cream", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts" },
  { _id: "10", name: "Fruit Ice Cream", price: 22, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts" },
  { _id: "11", name: "Jar Ice Cream", price: 10, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts" },
  { _id: "12", name: "Vanilla Ice Cream", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts" },
  { _id: "13", name: "Chicken Sandwich", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich" },
  { _id: "14", name: "Vegan Sandwich", price: 18, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich" },
  { _id: "15", name: "Grilled Sandwich", price: 16, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich" },
  { _id: "16", name: "Bread Sandwich", price: 24, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich" },
  { _id: "17", name: "Cup Cake", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Cake" },
  { _id: "18", name: "Vegan Cake", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Cake" },
  { _id: "19", name: "Butterscotch Cake", price: 20, description: "Food provides essential nutrients for overall health and well-being", category: "Cake" },
  { _id: "20", name: "Sliced Cake", price: 15, description: "Food provides essential nutrients for overall health and well-being", category: "Cake" },
  { _id: "21", name: "Garlic Mushroom", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg" },
  { _id: "22", name: "Fried Cauliflower", price: 22, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg" },
  { _id: "23", name: "Mix Veg Pulao", price: 10, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg" },
  { _id: "24", name: "Rice Zucchini", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg" },
  { _id: "25", name: "Cheese Pasta", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta" },
  { _id: "26", name: "Tomato Pasta", price: 18, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta" },
  { _id: "27", name: "Creamy Pasta", price: 16, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta" },
  { _id: "28", name: "Chicken Pasta", price: 24, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta" },
  { _id: "29", name: "Butter Noodles", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles" },
  { _id: "30", name: "Veg Noodles", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles" },
  { _id: "31", name: "Somen Noodles", price: 20, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles" },
  { _id: "32", name: "Cooked Noodles", price: 15, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles" }
];

async function seedCategories() {
  console.log("📁 Seeding categories...");
  
  const batch = db.batch();
  
  categories.forEach((cat, index) => {
    const docRef = db.collection(CATEGORIES_COLLECTION).doc(`cat_${index + 1}`);
    batch.set(docRef, cat);
  });
  
  await batch.commit();
  console.log(`✅ Seeded ${categories.length} categories`);
}

async function seedMenuItems() {
  console.log("🍕 Seeding menu items...");
  
  const batch = db.batch();
  
  foodItems.forEach((item) => {
    const docRef = db.collection(MENU_COLLECTION).doc(item._id);
    batch.set(docRef, {
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      imageKey: `food_${item._id}`,
      inStock: true,
      createdAt: new Date().toISOString()
    });
  });
  
  await batch.commit();
  console.log(`✅ Seeded ${foodItems.length} menu items`);
}

async function seedInventory() {
  console.log("📦 Seeding inventory...");
  
  const batch = db.batch();
  
  foodItems.forEach((item) => {
    const docRef = db.collection(INVENTORY_COLLECTION).doc(item._id);
    batch.set(docRef, {
      itemId: item._id,
      name: item.name,
      quantity: DEFAULT_INVENTORY_QUANTITY,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });
  
  await batch.commit();
  console.log(`✅ Seeded inventory for ${foodItems.length} items (${DEFAULT_INVENTORY_QUANTITY} each)`);
}

async function main() {
  console.log("🚀 Starting database seeding...\n");
  
  try {
    await seedCategories();
    await seedMenuItems();
    await seedInventory();
    console.log("\n✨ Database seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

main();
