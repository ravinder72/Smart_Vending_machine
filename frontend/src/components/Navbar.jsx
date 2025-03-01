import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { items } from './Data';
import { BsFillCartCheckFill } from 'react-icons/bs';

const Navbar = ({ setData, cart }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filterByCategory = (category) => {
    const element = items.filter((product) => product.category === category);
    setData(element);
  };

  const filterByPrice = (price) => {
    const element = items.filter((product) => product.price >= price);
    setData(element);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search/${searchTerm}`);
    setSearchTerm("");
  };

  return (
    <>
      <header className="sticky-top">
        <div className="nav-bar">
          <Link to="/" className="brand brand-button">Smart Vend</Link>

          <form onSubmit={handleSubmit} className="search-bar">
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Search Products"
            />
          </form>

          <Link to="/cart" className="cart">
            <button type="button" className="btn btn-primary position-relative">
              <BsFillCartCheckFill style={{ fontSize: '2rem' }} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cart.length}
                <span className="visually-hidden">unread messages</span>
              </span>
            </button>
          </Link>
        </div>

        {location.pathname === '/' && (
          <div className="nav-bar-wrapper">
  <button onClick={() => setData(items)} className="category-button">ALL Products</button>
  <button onClick={() => filterByCategory('Snacks')} className="category-button">Snacks</button>
  <button onClick={() => filterByCategory('Beverages')} className="category-button">Beverages</button>
  <button onClick={() => filterByCategory('Health & fitness')} className="category-button">Health & Fitness</button>
  <button onClick={() => filterByCategory('Chocolates')} className="category-button">Chocolates</button>
  <button onClick={() => filterByPrice(10)} className="category-button">{">="}10</button>
  <button onClick={() => filterByPrice(20)} className="category-button">{">="}20</button>
  <button onClick={() => filterByPrice(50)} className="category-button">{">="}50</button>
</div>

        )}
      </header>
    </>
  );
};

export default Navbar;
