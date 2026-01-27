import { createContext, useEffect, useState } from "react";
import { food_list as localFoodList, menu_list } from "../assets/assets";
import { useAuth } from "./AuthContext";
import { getCart, saveCart } from "../firebase/cartService";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState(localFoodList);
  const [loading, setLoading] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  // Load cart from Firestore when user logs in
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        const result = await getCart(user.uid);
        if (result.success && result.cart) {
          setCartItems(result.cart);
        }
        setLoading(false);
      } else {
        // Clear cart when user logs out
        setCartItems({});
      }
    };
    
    loadCart();
  }, [isAuthenticated, user]);

  // Sync cart to Firestore whenever it changes (for logged-in users)
  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated && user && Object.keys(cartItems).length >= 0) {
        await saveCart(user.uid, cartItems);
      }
    };
    
    // Debounce the sync to avoid too many writes
    const timeoutId = setTimeout(syncCart, 500);
    return () => clearTimeout(timeoutId);
  }, [cartItems, isAuthenticated, user]);

  const addToCart = (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
  };

  const clearCart = () => {
    setCartItems({});
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const getCartItemsCount = () => {
    let count = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        count += cartItems[item];
      }
    }
    return count;
  };

  // Get cart items with full details for order placement
  const getCartItemsWithDetails = () => {
    const items = [];
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = food_list.find((product) => product._id === itemId);
        if (itemInfo) {
          items.push({
            itemId: itemInfo._id,
            name: itemInfo.name,
            price: itemInfo.price,
            quantity: cartItems[itemId]
          });
        }
      }
    }
    return items;
  };

  const contextValue = {
    food_list,
    menu_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount,
    getCartItemsCount,
    getCartItemsWithDetails,
    loading,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
