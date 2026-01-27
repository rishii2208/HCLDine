// Firestore Security Rules
// Copy these rules to your Firebase Console > Firestore > Rules

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read and update their own profile
      allow read, write: if isOwner(userId);
      
      // Cart subcollection
      match /cart/{document=**} {
        allow read, write: if isOwner(userId);
      }
      
      // User's orders reference subcollection
      match /orders/{document=**} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId);
      }
    }
    
    // Menu collection - Public read, no client writes
    match /menu/{itemId} {
      allow read: if true;
      allow write: if false; // Only admin via Firebase Console or Admin SDK
    }
    
    // Categories collection - Public read, no client writes
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if false; // Only admin via Firebase Console or Admin SDK
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      // Users can create orders with their own userId
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      
      // No client updates/deletes - handled by admin
      allow update, delete: if false;
    }
  }
}
*/

// Instructions:
// 1. Go to Firebase Console (https://console.firebase.google.com)
// 2. Select your project: hcltech-a78ba
// 3. Navigate to Firestore Database > Rules
// 4. Copy the rules above (without the JS comments)
// 5. Click "Publish"

export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      
      match /cart/{document=**} {
        allow read, write: if isOwner(userId);
      }
      
      match /orders/{document=**} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId);
      }
    }
    
    match /menu/{itemId} {
      allow read: if true;
      allow write: if false;
    }
    
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if false;
    }
    
    match /orders/{orderId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
`;
