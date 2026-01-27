import React, { useState, useEffect } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ,
);

const CheckoutForm = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    setProcessing(false);
    if (error) {
      alert("Payment failed: " + error.message);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="card-element-wrapper">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        className="pay-btn"
      >
        {processing ? (
          <>
            <span className="spinner"></span>
            Processing...
          </>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1"
                y="4"
                width="22"
                height="16"
                rx="2"
                ry="2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="1"
                y1="10"
                x2="23"
                y2="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Complete Payment
          </>
        )}
      </button>
    </form>
  );
};

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const fetchCart = async () => {
    try {
      const response = await axios.get("/cart");
      setCartItems(response.data.products || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(`/cart/${productId}`, {
        quantity: newQuantity,
      });
      fetchCart();
      console.log("Quantity updated");
    } catch (error) {
      console.error("Error updating cart:", error);
      alert("Failed to update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`/cart/${productId}`);
      fetchCart();
      console.log("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await axios.post(
        "/create-payment-intent",
        { amount: Math.round(total * 100) },
      );
      setClientSecret(response.data.client_secret);
      setShowCheckout(true);
    } catch (error) {
      alert("Failed to create payment intent");
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="page-header">
          <h1>Shopping Cart</h1>
          <p className="page-subtitle">Loading your items...</p>
        </div>
        <div className="cart-loading">
          <span className="spinner large"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-header">
        <h1>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="9"
              cy="21"
              r="1"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              cx="20"
              cy="21"
              r="1"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Shopping Cart
        </h1>
        <p className="page-subtitle">
          {cartItems.length === 0
            ? "Your cart is empty"
            : `${cartItems.length} ${cartItems.length === 1 ? "item" : "items"} in your cart`}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="9"
              cy="21"
              r="1"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              cx="20"
              cy="21"
              r="1"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started</p>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.productId} className="cart-item-card">
                <div className="cart-item-image">
                  <img
                    src={item.imageUrl || "/placeholder.png"}
                    alt={item.name}
                  />
                </div>

                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-price">
                    <span className="currency">$</span>
                    <span className="amount">{item.price}</span>
                  </p>
                </div>

                <div className="cart-item-controls">
                  <div className="quantity-control">
                    <button
                      className="quantity-btn"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <line
                          x1="5"
                          y1="12"
                          x2="19"
                          y2="12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <span className="quantity-value">
                      {console.log(item.quantity)}
                      {item.quantity}
                    </span>

                    <button
                      className="quantity-btn"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <line
                          x1="12"
                          y1="5"
                          x2="12"
                          y2="19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <line
                          x1="5"
                          y1="12"
                          x2="19"
                          y2="12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                  <button
                    className="remove-item-btn"
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove item"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline
                        points="3 6 5 6 21 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="10"
                        y1="11"
                        x2="10"
                        y2="17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="14"
                        y1="11"
                        x2="14"
                        y2="17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-badge">Free</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span className="total-amount">${total.toFixed(2)}</span>
                </div>
              </div>

              {!showCheckout ? (
                <button
                  className="checkout-btn-primary"
                  onClick={handleCheckout}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="1"
                      y="4"
                      width="22"
                      height="16"
                      rx="2"
                      ry="2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="1"
                      y1="10"
                      x2="23"
                      y2="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Proceed to Checkout
                </button>
              ) : (
                <div className="checkout-section">
                  <Elements stripe={stripePromise}>
                    <CheckoutForm
                      clientSecret={clientSecret}
                      onSuccess={async () => {
                        try {
                          await axios.post("/checkout");
                          alert("Payment successful!");
                          setShowCheckout(false);
                          fetchCart();
                        } catch (error) {
                          alert("Checkout failed");
                        }
                      }}
                    />
                  </Elements>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
