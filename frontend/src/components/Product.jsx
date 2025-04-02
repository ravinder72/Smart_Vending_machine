import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Product = ({ items, cart, setCart }) => {
  // Initialize stock state with all items set to 0
  const [stock, setStock] = useState(
    items.reduce((acc, product) => {
      acc[product.id] = 0;
      return acc;
    }, {})
  );

  // Fetch updated stock data from the server
  
  const apiUrl = import.meta.env.VITE_BACKEND_URL || "*";

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: "1-2,2-8,3-7",
          }),
        });
        const data = await response.json();
        
        if (data.items) {
          const updatedStock = {};
          data.items.forEach(({ itemId, quantity }) => {
            updatedStock[itemId] = quantity;
          });
  
          setStock((prevStock) => ({
            ...prevStock,
            ...updatedStock,
          }));
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };
  
    fetchStockData();
  }, []);
  
  
  
  const addToCart = (id, price, title, description, imgSrc) => {
    if (stock[id] === 0) {
      // Show toast if the product is out of stock
      toast.error(`${title} is out of stock`, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    // Add product to cart
    const obj = { id, price, title, description, imgSrc };
    setCart([...cart, obj]);

    // Reduce stock by 1
    setStock((prevStock) => ({
      ...prevStock,
      [id]: Math.max(prevStock[id] - 1, 0), // Prevent stock from going below 0
    }));

    // Show success toast
    toast.success(`${title} added to cart`, {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="containerx">
        <div className="row">
          {items.map((product) => {
            return (
              <div key={product.id} className="col-lg-4 col-md-6 my-3 text-center">
                <div className="card" style={{ width: "18rem" }}>
                  <Link
                    to={`/product/${product.id}`}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img src={product.imgSrc} className="card-img-top" alt="..." />
                  </Link>
                  <div className="card-body">
                    <h5 className="card-title">{product.title}</h5>
                    <p className="card-text">{product.description}</p>
                    <p>Available: {stock[product.id]}</p> {/* Display stock count */}
                    <button className="btn btn-primary mx-3">
                      {'Rs '}{product.price}
                    </button>
                    <button
                      onClick={() =>
                        addToCart(product.id, product.price, product.title, product.description, product.imgSrc)
                      }
                      className="btn btn-warning"
                      disabled={stock[product.id] === 0} // Disable button if out of stock
                    >
                      {stock[product.id] === 0 ? "Out of Stock" : "Add To Cart"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Product;
