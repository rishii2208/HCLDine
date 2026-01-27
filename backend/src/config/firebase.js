// Firebase Admin SDK Configuration
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

let app;

try {
  // Try to load service account from file
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
    join(__dirname, "..", "serviceAccountKey.json");
  
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin:", error.message);
  console.log("📋 Please download serviceAccountKey.json from Firebase Console:");
  console.log("   Project Settings > Service Accounts > Generate New Private Key");
  process.exit(1);
}

export const db = admin.firestore();
export const auth = admin.auth();
export default app;
