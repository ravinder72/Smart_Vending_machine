import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Product = ({ items, cart, setCart, vendingMachineId, setVendingMachineId }) => {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const [stock, setStock] = useState(
    items.reduce((acc, product) => {
      acc[product.id] = 0;
      return acc;
    }, {})
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!vendingMachineId.trim()) {
        toast.error("Please enter a valid Vending Machine ID.");
        return;
    }

    alert(`Vending Machine ID: ${vendingMachineId}`);
    setShowCheckoutForm(false);

    // Send '1' to the webhook
    const webhookUrl = "https://eofgd087th906qk.m.pipedream.net";
    const payload = {
        event: "VENDING_MACHINE_INITIALIZED",
        vendingMachineId: vendingMachineId,
        data: '1',
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
    } catch (error) {
        console.error("Error sending webhook:", error);
        alert("Failed to notify vending machine.");
    }

    // Wait for 8 seconds before fetching stock data
    setTimeout(async () => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${apiUrl}/api/data`);
            const data = await response.json();

            console.log("Stock Data Fetched:", data);

            if (data.items) {
                setStock((prevStock) => {
                    const updatedStock = { ...prevStock };
                    data.items.forEach(({ itemId, quantity }) => {
                        updatedStock[itemId] = quantity;
                    });
                    return updatedStock;
                });
            }
        } catch (error) {
            console.error("Error fetching stock data:", error);
        }
    }, 18000);
};



  const addToCart = (id, price, title, description, imgSrc) => {
    if (stock[id] === 0) {
      toast.error(`${title} is out of stock`);
      return;
    }

    const obj = { id, price, title, description, imgSrc, vendingMachineId };
    setCart([...cart, obj]);

    setStock((prevStock) => ({
      ...prevStock,
      [id]: Math.max(prevStock[id] - 1, 0),
    }));

    toast.success(`${title} added to cart`);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} theme="dark" />

      <button onClick={() => setShowCheckoutForm(true)} className="btn btn-primary">
        Set Vending ID
      </button>

      {showCheckoutForm && (
        <div className="checkout-form-modal" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="checkout-form" style={{
            backgroundColor: '#fff', padding: '20px', borderRadius: '8px',
            width: '400px', textAlign: 'center'
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
              <button type="submit" className="btn btn-primary">Proceed</button>
              <button onClick={() => setShowCheckoutForm(false)} className="btn btn-secondary" style={{ marginLeft: '10px' }}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <div className="containerx">
        <div className="row">
          {items.map((product) => (
            <div key={product.id} className="col-lg-4 col-md-6 my-3 text-center">
              <div className="card" style={{ width: "18rem" }}>
                <Link to={`/product/${product.id}`} style={{
                  display: "flex", justifyContent: "center", alignItems: "center",
                }}>
                  <img src={product.imgSrc} className="card-img-top" alt={product.title} />
                </Link>
                <div className="card-body">
                  <h5 className="card-title">{product.title}</h5>
                  <p className="card-text">{product.description}</p>
                  <p>Available: {stock[product.id]}</p>
                  <button className="btn btn-primary mx-3">Rs {product.price}</button>
                  <button
                    onClick={() => addToCart(product.id, product.price, product.title, product.description, product.imgSrc)}
                    className="btn btn-warning"
                    disabled={stock[product.id] === 0}
                  >
                    {stock[product.id] === 0 ? "Out of Stock" : "Add To Cart"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Product;
