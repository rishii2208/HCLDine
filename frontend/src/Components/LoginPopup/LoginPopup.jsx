import React, { useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { useAuth } from "../../Context/AuthContext";

const LoginPopup = ({ setShowLogin }) => {
  const [currentState, setCurrentState] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      
      if (currentState === "Login") {
        result = await login(email, password);
      } else {
        result = await register(email, password, name);
      }

      if (result.success) {
        setShowLogin(false);
      } else {
        setError(result.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="login-popup">
      <form onSubmit={handleSubmit} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currentState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>
        
        {error && <p className="login-error" style={{ color: "red", fontSize: "14px", marginBottom: "10px" }}>{error}</p>}
        
        <div className="login-popup-inputs">
          {currentState === "Login" ? (
            <></>
          ) : (
            <input 
              type="text" 
              placeholder="Your name" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input 
            type="email" 
            placeholder="Your Email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : (currentState === "sign up" ? "Create Account" : "Login")}
        </button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, i agree to the terms of use & privacy policy.</p>
        </div>
        {currentState === "Login" ? (
          <p>
            Create new account?{" "}
            <span onClick={() => { setCurrentState("sign up"); setError(""); }}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an accout?{" "}
            <span onClick={() => { setCurrentState("Login"); setError(""); }}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
