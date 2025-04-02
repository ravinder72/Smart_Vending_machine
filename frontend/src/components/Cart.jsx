import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Cart = ({ cart, setCart }) => {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [vendingMachineId, setVendingMachineId] = useState("");

  // Calculate the total price by summing up the prices of all products in the cart
  const totalPrice = cart.reduce((acc, product) => acc + Number(product.price), 0);

  // Function to handle removing an item from the cart
  const handleRemoveItem = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
  };

  // Function to handle checkout button click
  const handleCheckout = () => {
    setShowCheckoutForm(true);
  };

  // Function to handle form submission (Vending Machine ID form)
  
  const handleFormSubmit = async(e) => {
    e.preventDefault();
    alert(`Vending Machine ID: ${vendingMachineId}`);
    setShowCheckoutForm(false);
    setShowPaymentForm(true);
    //setVendingMachineId(""); // Reset vending machine ID
  };

  // UPI Payment Function
  const handleUPIPayment = async () => {
      if (!vendingMachineId || vendingMachineId.trim() === "") {
          alert("Error: Please enter a valid Vending Machine ID before making a payment.");
          return;
      }
      const upiId = "example@oksbi";  // 🔹 Replace with your actual UPI ID  
      const amount = totalPrice;  // 🔹 Total cart amount  
      const transactionId = `TXN${Date.now()}`;  // 🔹 Unique transaction ID  

      // 🔹 UPI deep link format  
      const upiUrl = `upi://pay?pa=${upiId}&pn=VendingMachine&tid=${transactionId}&tr=${transactionId}&tn=Payment&am=${amount}&cu=INR`;

      // 🔹 Open UPI payment  
      const upiAnchor = document.createElement("a");
      upiAnchor.href = upiUrl;
      upiAnchor.style.display = "none";
      document.body.appendChild(upiAnchor);
      upiAnchor.click();
      document.body.removeChild(upiAnchor);

      // 🔹 Wait for user confirmation after a few seconds
      setTimeout(async () => {
          const isPaid = window.confirm("Did you complete the payment?");
          if (isPaid) {
              const webhookUrl = "https://eo3w4bepwknwo1c.m.pipedream.net"; // Your webhook endpoint

              const payload = {
                  event: "CHECKOUT_STARTED",
                  vendingMachineId: vendingMachineId,
                  cartItems: cart,
                  totalAmount: amount,
                  timestamp: new Date().toISOString(),
              };

              try {
                  const response = await fetch(webhookUrl, {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json",
                      },
                      body: JSON.stringify(payload),
                  });

                  const result = await response.text();
                  console.log("Webhook response:", result);
                  alert("Payment processed, vending will start soon!");

              } catch (error) {
                  console.error("Error sending webhook:", error);
                  alert("Payment successful, but there was an issue processing the vending machine.");
              }
          } else {
              alert("Payment not completed. Try again.");
          }
      }, 5000); // 🔹 Waits 5 seconds before asking
  };


  // Confirm Payment Button
  const handlePaymentConfirmation = () => {
    alert("Payment received! Thank you.");
    setShowPaymentForm(false);
  };

  return (
    <>
      <div className="container my-5" style={{ width: "54%" }}>
        {
          cart.length === 0 ? (
            <div className='text-center'>
              <h1>Your Cart is Empty</h1>
              <Link to={"/"} className='btn btn-warning'>Continue Shopping...</Link>
            </div>
          ) : (
            cart.map((product, index) => {
              return (
                <div key={index} className="card mb-3 my-5" style={{ width: '700px' }}>
                  <div className="row g-0">
                    <div className="col-md-4">
                      <img src={product.imgSrc} className="img-fluid rounded-start" alt={product.title} />
                    </div>
                    <div className="col-md-8">
                      <div className="card-body text-center">
                        <h5 className="card-title">{product.title}</h5>
                        <p className="card-text">{product.description}</p>
                        <button className="btn btn-primary mx-3">
                          Rs {product.price} 
                        </button>
                        <button onClick={() => handleRemoveItem(product.id)} className="btn btn-danger mx-3">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )
        }
      </div>

      {/* Display the total price and checkout/clear options if there are items in the cart */}
      {
        cart.length !== 0 && (
          <div className="container text-center my-5" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <div className="total-price">
              <h3>Total Price: Rs {totalPrice} </h3>
            </div>
            <button onClick={handleCheckout} className='btn btn-warning mx-5'>Checkout</button>
            <button onClick={() => setCart([])} className='btn btn-danger'>Clear Cart</button>
          </div>
        )
      }
      
      
      {/* Checkout Form Modal */}
      {showCheckoutForm && (
        <div className="checkout-form-modal" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'opacity 0.3s ease-in-out'
        }}>
          <div className="checkout-form" style={{
            backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px', textAlign: 'center',
            opacity: showCheckoutForm ? 1 : 0
          }}>
            <h2>Enter Vending Machine ID</h2>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                value={vendingMachineId}
                onChange={(e) => setVendingMachineId(e.target.value)}
                placeholder="Vending Machine ID"
                required
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <button type="submit" className="btn btn-primary">Proceed to Payment</button>
              <button onClick={() => setShowCheckoutForm(false)} className="btn btn-secondary" style={{ marginLeft: '10px' }}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="payment-form-modal" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'opacity 0.3s ease-in-out'
        }}>
          <div className="payment-form" style={{
            backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px', textAlign: 'center',
            opacity: showPaymentForm ? 1 : 0
          }}>
            <h2>Pay Now</h2>
            
            {/* UPI Payment Button */}
            <button onClick={handleUPIPayment} className="btn btn-primary mb-3" style={{ width: '100%' }}>
              Pay Now
            </button>

            {/* Confirm Payment Button */}
            <button onClick={handlePaymentConfirmation} className="btn btn-success mt-3">
              I have paid
            </button>

            <button onClick={() => setShowPaymentForm(false)} className="btn btn-secondary mt-3">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
