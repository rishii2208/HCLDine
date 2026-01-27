import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../Context/StoreContext";
import { useAuth } from "../../Context/AuthContext";
import { placeOrder } from "../../firebase/orderService";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, getCartItemsWithDetails, clearCart, checkCartItemsAvailability, refreshInventory } = useContext(StoreContext);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [soldOutItems, setSoldOutItems] = useState([]);
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSoldOutItems([]);

    if (!isAuthenticated) {
      setError("Please login to place an order");
      return;
    }

    const cartItems = getCartItemsWithDetails();
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    // Refresh inventory and check availability before placing order
    await refreshInventory();
    const unavailableItems = checkCartItemsAvailability();
    
    if (unavailableItems.length > 0) {
      setSoldOutItems(unavailableItems);
      setError("Some items in your cart are sold out or have insufficient stock. Please update your cart.");
      return;
    }

    setLoading(true);

    const subtotal = getTotalCartAmount();
    const deliveryFee = 2;
    const total = subtotal + deliveryFee;

    const orderData = {
      items: cartItems,
      deliveryInfo,
      subtotal,
      deliveryFee,
      total
    };

    const result = await placeOrder(user.uid, orderData);

    if (result.success) {
      clearCart();
      navigate("/myorders");
    } else {
      setError(result.error || "Failed to place order. Please try again.");
    }

    setLoading(false);
  };

  // Redirect if cart is empty
  if (getTotalCartAmount() === 0) {
    return (
      <div className="place-order" style={{ textAlign: "center", padding: "50px" }}>
        <h2>Your cart is empty</h2>
        <p>Add some items to your cart before placing an order.</p>
        <button onClick={() => navigate("/")} style={{ marginTop: "20px", padding: "10px 30px", cursor: "pointer" }}>
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        
        {error && (
          <div className="order-error">
            <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
            {soldOutItems.length > 0 && (
              <ul className="sold-out-list">
                {soldOutItems.map((item, index) => (
                  <li key={index} style={{ color: "#dc3545", fontSize: "14px" }}>• {item}</li>
                ))}
              </ul>
            )}
            <button 
              type="button"
              onClick={() => navigate("/cart")} 
              style={{ 
                marginTop: "10px", 
                padding: "8px 20px", 
                backgroundColor: "#ff6b6b",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Update Cart
            </button>
          </div>
        )}
        
        <div className="multi-fields">
          <input 
            type="text" 
            name="firstName"
            placeholder="First Name" 
            value={deliveryInfo.firstName}
            onChange={handleChange}
            required 
          />
          <input 
            type="text" 
            name="lastName"
            placeholder="Last Name" 
            value={deliveryInfo.lastName}
            onChange={handleChange}
            required 
          />
        </div>
        <input 
          type="email" 
          name="email"
          placeholder="Email address" 
          value={deliveryInfo.email}
          onChange={handleChange}
          required 
        />
        <input 
          type="text" 
          name="street"
          placeholder="Street" 
          value={deliveryInfo.street}
          onChange={handleChange}
          required 
        />
        <div className="multi-fields">
          <input 
            type="text" 
            name="city"
            placeholder="City" 
            value={deliveryInfo.city}
            onChange={handleChange}
            required 
          />
          <input 
            type="text" 
            name="state"
            placeholder="State" 
            value={deliveryInfo.state}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="multi-fields">
          <input 
            type="text" 
            name="zipCode"
            placeholder="Zip code" 
            value={deliveryInfo.zipCode}
            onChange={handleChange}
            required 
          />
          <input 
            type="text" 
            name="country"
            placeholder="Country" 
            value={deliveryInfo.country}
            onChange={handleChange}
            required 
          />
        </div>
        <input 
          type="text" 
          name="phone"
          placeholder="Phone" 
          value={deliveryInfo.phone}
          onChange={handleChange}
          required 
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery fee</p>
              <p>${2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "PLACING ORDER..." : "PLACE ORDER"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
