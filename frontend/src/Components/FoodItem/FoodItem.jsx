import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, isItemSoldOut, getItemStock } = useContext(StoreContext);
  
  const soldOut = isItemSoldOut(id);
  const stock = getItemStock(id);
  
  return (
    <div className={`food-item ${soldOut ? 'sold-out' : ''}`}>
      <div className="food-item-img-container">
        <img src={image} alt="" className={`food-item-image ${soldOut ? 'grayscale' : ''}`} />
        
        {/* Sold Out Banner */}
        {soldOut && (
          <div className="sold-out-banner">
            <span>SOLD OUT</span>
          </div>
        )}
        
        {/* Add to cart controls - only show if not sold out */}
        {!soldOut && (
          <>
            {!cartItems[id] ? (
              <img
                className="add"
                onClick={() => addToCart(id)}
                src={assets.add_icon_white}
                alt="Add to cart"
              />
            ) : (
              <div className="food-item-counter">
                <img
                  onClick={() => removeFromCart(id)}
                  src={assets.remove_icon_red}
                  alt="Remove"
                />
                <p>{cartItems[id]}</p>
                <img
                  onClick={() => addToCart(id)}
                  src={assets.add_icon_green}
                  alt="Add more"
                />
              </div>
            )}
          </>
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="Rating" />
        </div>
        <p className="food-item-description">{description}</p>
        <div className="food-item-price-row">
          <p className="food-item-price">${price}</p>
          {soldOut ? (
            <span className="stock-status sold-out-text">Sold Out</span>
          ) : stock <= 10 ? (
            <span className="stock-status low-stock">Only {stock} left!</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
