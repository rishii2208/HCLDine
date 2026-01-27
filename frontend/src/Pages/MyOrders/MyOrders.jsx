import React, { useEffect, useState } from "react";
import "./MyOrders.css";
import { useAuth } from "../../Context/AuthContext";
import { getUserOrders } from "../../firebase/orderService";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user) {
        console.log("Not authenticated or no user");
        setLoading(false);
        return;
      }

      console.log("Fetching orders for user:", user.uid);
      const result = await getUserOrders(user.uid);
      console.log("Orders result:", result);
      if (result.success) {
        setOrders(result.orders);
      } else {
        console.error("Failed to fetch orders:", result.error);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [isAuthenticated, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#ffc107";
      case "confirmed": return "#17a2b8";
      case "preparing": return "#6f42c1";
      case "out_for_delivery": return "#fd7e14";
      case "delivered": return "#28a745";
      case "cancelled": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const formatOrderDate = (order) => {
    // Use orderDate if available, otherwise fall back to createdAt
    const timestamp = order.orderDate || order.createdAt;
    return formatDate(timestamp);
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (!isAuthenticated) {
    return (
      <div className="my-orders">
        <h2>Please login to view your orders</h2>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-orders">
        <h2>My Orders</h2>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate("/")}>Browse Menu</button>
        </div>
      ) : (
        <div className="orders-container">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header" onClick={() => toggleOrderDetails(order.id)}>
                <div className="order-icon">
                  <img src={assets.parcel_icon} alt="" />
                </div>
                <div className="order-info">
                  <p className="order-id">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="order-date">
                    📅 {formatOrderDate(order)}
                  </p>
                  <p className="order-items-summary">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </p>
                </div>
              </div>
              
              <div className="order-details">
                <p className="order-total">${order.total?.toFixed(2) || '0.00'}</p>
                <p 
                  className="order-status"
                  style={{ color: getStatusColor(order.status) }}
                >
                  <span className="status-dot" style={{ backgroundColor: getStatusColor(order.status) }}></span>
                  {(order.status || 'pending').replace(/_/g, " ").toUpperCase()}
                </p>
              </div>
              
              <button 
                className="track-btn"
                onClick={() => toggleOrderDetails(order.id)}
              >
                {expandedOrder === order.id ? "Hide Details" : "View Details"}
              </button>
              
              {/* Expanded Order Details */}
              {expandedOrder === order.id && (
                <div className="order-expanded">
                  <div className="order-items-list">
                    <h4>Order Items:</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>${item.price?.toFixed(2)}</td>
                            <td>${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="summary-row">
                      <span>Delivery Fee:</span>
                      <span>${order.deliveryFee?.toFixed(2) || '2.00'}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>${order.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  
                  {order.deliveryInfo && (
                    <div className="delivery-info">
                      <h4>Delivery Address:</h4>
                      <p>
                        {order.deliveryInfo.firstName} {order.deliveryInfo.lastName}<br />
                        {order.deliveryInfo.street}<br />
                        {order.deliveryInfo.city}, {order.deliveryInfo.state} {order.deliveryInfo.zipCode}<br />
                        {order.deliveryInfo.country}<br />
                        📞 {order.deliveryInfo.phone}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
