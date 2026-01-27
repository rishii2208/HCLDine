import React, { useContext, useState, useEffect } from "react";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, isItemSoldOut, getItemStock, checkCartItemsAvailability } =
    useContext(StoreContext);
  const [unavailableItems, setUnavailableItems] = useState([]);

  const navigate = useNavigate();
  
  // Check for unavailable items when cart changes
  useEffect(() => {
    setUnavailableItems(checkCartItemsAvailability());
  }, [cartItems, checkCartItemsAvailability]);

  const hasUnavailableItems = unavailableItems.length > 0;

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            const soldOut = isItemSoldOut(item._id);
            const stock = getItemStock(item._id);
            const insufficientStock = cartItems[item._id] > stock;
            
            return (
              <div key={item._id}>
                <div className={`cart-items-title cart-items-item ${soldOut || insufficientStock ? 'unavailable-item' : ''}`}>
                  <img src={item.image} alt="" style={soldOut ? { filter: 'grayscale(100%)' } : {}} />
                  <div>
                    <p>{item.name}</p>
                    {soldOut && <span className="cart-sold-out-badge">SOLD OUT</span>}
                    {!soldOut && insufficientStock && (
                      <span className="cart-low-stock-badge">Only {stock} available</span>
                    )}
                  </div>
                  <p>${item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>${item.price * cartItems[item._id]}</p>
                  <p onClick={() => removeFromCart(item._id)} className="cross">
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          }
        })}
      </div>
      <div className="cart-bottom">
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
          
          {hasUnavailableItems && (
            <div className="cart-warning">
              <p>⚠️ Some items are unavailable:</p>
              <ul>
                {unavailableItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <p>Please remove them to proceed.</p>
            </div>
          )}
          
          <button 
            onClick={() => navigate("/order")}
            disabled={hasUnavailableItems}
            style={hasUnavailableItems ? { backgroundColor: '#ccc', cursor: 'not-allowed' } : {}}
          >
            {hasUnavailableItems ? 'REMOVE UNAVAILABLE ITEMS' : 'PROCEED TO CHECKOUT'}
          </button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code,Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="promocode" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
