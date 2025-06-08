import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Product from './components/Product';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductDetail from './components/ProductDetail';
import SearchItem from './components/SearchItem';
import Cart from './components/Cart';
import { items } from './components/Data';

const App = () => {
  const [data, setData] = useState([...items]);
  const [cart, setCart] = useState([]);
  const [vendingMachineId, setVendingMachineId] = useState(""); // ✅ Added vendingMachineId

  return (
    <>
      <Router>
        <Navbar cart={cart} setData={setData} />
        <Routes>
          {/* ✅ Pass vendingMachineId and setter to Product */}
          <Route path="/" element={<Product 
            cart={cart} setCart={setCart} 
            items={data} 
            vendingMachineId={vendingMachineId} 
            setVendingMachineId={setVendingMachineId} 
          />} />

          <Route path="/product/:id" element={<ProductDetail cart={cart} setCart={setCart} />} />
          <Route path="/search/:term" element={<SearchItem cart={cart} setCart={setCart} />} />

          {/* ✅ Pass vendingMachineId to Cart */}
          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} vendingMachineId={vendingMachineId} />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
