import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { items } from "./Data";
import Product from "./Product";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductDetail = ({ cart, setCart }) => {
  const { id } = useParams();

  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [stock, setStock] = useState({});

  useEffect(() => {
    const filterProduct = items.filter((product) => product.id == id);
    setProduct(filterProduct[0]);

    const relatedProducts = items.filter(
      (product) => product.category === filterProduct[0]?.category
    );
    setRelatedProducts(relatedProducts);

    // Initialize stock for all products: 10 for most, 1 for "Cadbury Dairy Milk"
    const initialStock = items.reduce((acc, product) => {
      acc[product.id] = product.title === "Cadbury Dairy Milk" ? 1 : 10;
      return acc;
    }, {});
    setStock(initialStock);
  }, [id]);

  const addToCart = (id, price, title, description, imgSrc) => {
    if (stock[id] === 0) {
      // Show toast if product is out of stock
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

    // Decrease stock by 1
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
      <div className="container con">
        <div className="img">
          <img src={product.imgSrc} alt={product.title} />
        </div>
        <div className="text-center">
          <h1 className="card-title">{product.title}</h1>
          <p className="card-text">{product.description}</p>
          <p>Available: {stock[product.id]}</p> {/* Show available stock */}
          <button className="btn btn-primary mx-3">
            {product.price} ₹
          </button>
          <button
            onClick={() =>
              addToCart(
                product.id,
                product.price,
                product.title,
                product.description,
                product.imgSrc
              )
            }
            className="btn btn-warning"
            disabled={stock[product.id] === 0} // Disable button if out of stock
          >
            {stock[product.id] === 0 ? "Out of Stock" : "Add To Cart"}
          </button>
        </div>
      </div>
      <h1 className="text-center">Related Products</h1>
      <Product cart={cart} setCart={setCart} items={relatedProducts} stock={stock} setStock={setStock} />
    </>
  );
};

export default ProductDetail;
