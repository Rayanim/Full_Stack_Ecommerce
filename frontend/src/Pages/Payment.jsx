// Payment.jsx
import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../Context/ShopContext";
import { backend_url, currency } from "../App";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

const Payment = () => {
  const { products, cartItems, getTotalCartAmount } = useContext(ShopContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasItemsInCart, setHasItemsInCart] = useState(false);

  // Check if cart has items
  useEffect(() => {
    const hasItems = Object.values(cartItems).some(quantity => quantity > 0);
    setHasItemsInCart(hasItems);
    
    if (!hasItems) {
      alert("Your cart is empty. Please add products before proceeding to payment.");
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  // Get user email from token if available
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        
        fetch(`${backend_url}/getuser`, {
          headers: {
            "auth-token": token,
          },
        })
          .then((response) => response.json())
          .then((userData) => {
            if (userData && userData.email) {
              setFormData((prev) => ({
                ...prev,
                email: userData.email,
              }));
            }
          })
          .catch((error) => {
            if (payload && payload.user && payload.user.email) {
              setFormData((prev) => ({
                ...prev,
                email: payload.user.email,
              }));
            }
          });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasItemsInCart) {
      alert("Your cart is empty. Please add products before proceeding to payment.");
      navigate("/cart");
      return;
    }
    
    setIsProcessing(true);

    try {
      // Validate form based on payment method
      if (paymentMethod === "card") {
        if (
          !formData.firstName ||
          !formData.lastName ||
          !formData.email ||
          !formData.address ||
          !formData.city ||
          !formData.zipCode ||
          !formData.cardNumber ||
          !formData.expiry ||
          !formData.cvv ||
          !formData.cardName
        ) {
          alert("Please fill in all required fields");
          setIsProcessing(false);
          return;
        }
      } else {
        // For PayPal, only basic info is needed
        if (
          !formData.firstName ||
          !formData.lastName ||
          !formData.email ||
          !formData.address ||
          !formData.city ||
          !formData.zipCode
        ) {
          alert("Please fill in all required fields");
          setIsProcessing(false);
          return;
        }
      }

      // Process payment (simulated)
      console.log("Processing payment with data:", formData);

      // Clear the cart after successful payment
      const token = localStorage.getItem("auth-token");
      if (token) {
        for (const productId in cartItems) {
          if (cartItems[productId] > 0) {
            for (let i = 0; i < cartItems[productId]; i++) {
              await fetch(`${backend_url}/removefromcart`, {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "auth-token": token,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId: parseInt(productId) }),
              });
            }
          }
        }
      }

      // Show success message and redirect
      alert("Payment processed successfully! Your order is on the way.");
      navigate("/");
    } catch (error) {
      console.error("Payment error:", error);
      alert("There was an error processing your payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = getTotalCartAmount();
  const tax = totalAmount * 0.08;
  const finalTotal = totalAmount + tax;

  if (!hasItemsInCart) {
    return (
      <div className="payment-container">
        <div className="empty-cart-message">
          <h2>Your cart is empty</h2>
          <p>Please add products to your cart before proceeding to payment.</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <header className="payment-header">
        <div className="logo">FASHIONSTORE</div>
        <div className="progress-bar">
          <div className="progress-step completed">1</div>
          <div className="progress-step completed">2</div>
          <div className="progress-step active">3</div>
        </div>
      </header>

      <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Shipping Information</h2>

          <div className="form-section">
            <div className="row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Street Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code *</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <h2>Payment Method</h2>

          <div className="payment-options">
            <div
              className={`payment-option ${
                paymentMethod === "card" ? "selected" : ""
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              <i className="fa-solid fa-credit-card"></i>
              <p>Credit Card</p>
            </div>
            <div
              className={`payment-option ${
                paymentMethod === "paypal" ? "selected" : ""
              }`}
              onClick={() => setPaymentMethod("paypal")}
            >
              <i className="fa-brands fa-paypal"></i>
              <p>PayPal</p>
            </div>
          </div>

          {paymentMethod === "card" && (
            <div className="payment-form active">
              <div className="card-icons">
                <div className="card-icon">VISA</div>
                <div className="card-icon">MC</div>
                <div className="card-icon">AMEX</div>
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber">Card Number *</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  required={paymentMethod === "card"}
                />
              </div>

              <div className="row">
                <div className="form-group">
                  <label htmlFor="expiry">Expiry Date *</label>
                  <input
                    type="text"
                    id="expiry"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    required={paymentMethod === "card"}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV *</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    required={paymentMethod === "card"}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cardName">Name on Card *</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required={paymentMethod === "card"}
                />
              </div>
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div className="payment-form active">
              <p>
                You will be redirected to PayPal to complete your payment
                securely.
              </p>
              <button type="button" className="btn btn-paypal">
                <i className="fa-brands fa-paypal"></i> Continue with PayPal
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isProcessing || !hasItemsInCart}
          >
            {isProcessing
              ? "Processing..."
              : `Pay ${currency}${finalTotal.toFixed(2)}`}
          </button>

          <div className="security-note">
            <p>
              <i className="fa-solid fa-lock"></i> Your payment information is
              encrypted and secure
            </p>
          </div>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="order-items">
            {products.map((product) => {
              if (cartItems[product.id] > 0) {
                return (
                  <div key={product.id} className="order-item">
                    <div className="item-info">
                      <img
                        src={`${backend_url}${product.image}`}
                        alt={product.name}
                        className="item-image"
                      />
                      <div>
                        <div>{product.name}</div>
                        <div className="item-price">
                          {currency}
                          {product.new_price} × {cartItems[product.id]}
                        </div>
                      </div>
                    </div>
                    <div className="item-total">
                      {currency}
                      {(product.new_price * cartItems[product.id]).toFixed(2)}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div className="order-total">
            <div className="total-row">
              <div>Subtotal</div>
              <div>
                {currency}
                {totalAmount.toFixed(2)}
              </div>
            </div>
            <div className="total-row">
              <div>Shipping</div>
              <div>FREE</div>
            </div>
            <div className="total-row">
              <div>Tax</div>
              <div>
                {currency}
                {tax.toFixed(2)}
              </div>
            </div>
            <div className="total-row final-total">
              <div>Total</div>
              <div>
                {currency}
                {finalTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;