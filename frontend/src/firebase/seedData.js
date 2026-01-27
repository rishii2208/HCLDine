// Seed Script - Run once to populate Firestore with menu data
// Usage: Import this in App.jsx temporarily and call seedDatabase()

import { seedMenuData, seedCategories } from "./menuService";
import { food_list, menu_list } from "../assets/assets";

/**
 * Seed all data to Firestore
 * Call this function once to populate your database
 */
export const seedDatabase = async () => {
  console.log("Starting database seeding...");
  
  // Seed menu items
  console.log("Seeding menu items...");
  const menuResult = await seedMenuData(food_list);
  if (menuResult.success) {
    console.log(`✅ Successfully seeded ${menuResult.count} menu items`);
  } else {
    console.error("❌ Failed to seed menu items:", menuResult.error);
  }
  
  // Seed categories
  console.log("Seeding categories...");
  const catResult = await seedCategories(menu_list);
  if (catResult.success) {
    console.log(`✅ Successfully seeded ${catResult.count} categories`);
  } else {
    console.error("❌ Failed to seed categories:", catResult.error);
  }
  
  console.log("Database seeding complete!");
};

export default seedDatabase;
