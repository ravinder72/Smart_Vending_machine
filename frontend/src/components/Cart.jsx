import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Cart = ({ cart, setCart, vendingMachineId }) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const totalPrice = cart.reduce((acc, product) => acc + Number(product.price), 0);

  const handleRemoveItem = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
  };

  const handleUPIPayment = async () => {
    if (!vendingMachineId || vendingMachineId.trim() === "") {
      alert("Error: Vending Machine ID is missing.");
      return;
    }
    const upiId = "example@oksbi";
    const amount = totalPrice;
    const transactionId = `TXN${Date.now()}`;

    const upiUrl = `upi://pay?pa=${upiId}&pn=VendingMachine&tid=${transactionId}&tr=${transactionId}&tn=Payment&am=${amount}&cu=INR`;

    const upiAnchor = document.createElement("a");
    upiAnchor.href = upiUrl;
    upiAnchor.style.display = "none";
    document.body.appendChild(upiAnchor);
    upiAnchor.click();
    document.body.removeChild(upiAnchor);

    setTimeout(async () => {
      const isPaid = window.confirm("Did you complete the payment?");
      if (isPaid) {
        const webhookUrl = "https://eo3w4bepwknwo1c.m.pipedream.net";

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

          setCart([]);
          setShowPaymentForm(false);
        } catch (error) {
          console.error("Error sending webhook:", error);
          alert("Payment successful, but vending machine processing failed.");
        }
      } else {
        alert("Payment not completed. Try again.");
      }
    }, 5000);
  };

  return (
    <>
      <div className="container my-5" style={{ width: "54%" }}>
        {cart.length === 0 ? (
          <div className='text-center'>
            <h1>Your Cart is Empty</h1>
            <Link to={'/'} className='btn btn-warning'>Continue Shopping...</Link>
          </div>
        ) : (
          cart.map((product, index) => (
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
          ))
        )}
      </div>

      {cart.length !== 0 && (
        <div className="container text-center my-5" style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
        }}>
          <div className="total-price">
            <h3>Total Price: Rs {totalPrice} </h3>
          </div>
          <button onClick={() => setShowPaymentForm(true)} className='btn btn-warning mx-5'>Proceed to Payment</button>
          <button onClick={() => setCart([])} className='btn btn-danger'>Clear Cart</button>
        </div>
      )}
      
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
            <button onClick={handleUPIPayment} className="btn btn-primary mb-3" style={{ width: '100%' }}>
              Pay Now
            </button>
            <button onClick={() => setShowPaymentForm(false)} className="btn btn-secondary mt-3">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
