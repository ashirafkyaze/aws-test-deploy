import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = async (productId) => {
    setAddingToCart(productId);
    try {
      await axios.post('/cart', { productId, quantity: 1 });
      // Show success feedback
      setTimeout(() => setAddingToCart(null), 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="page-header">
          <h1>Our Products</h1>
          <p className="page-subtitle">Discover amazing products tailored for you</p>
        </div>
        <div className="product-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="product-card skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-text"></div>
                <div className="skeleton-line skeleton-price"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
            <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Our Products
        </h1>
        <p className="page-subtitle">Discover amazing products tailored for you</p>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h3>No Products Available</h3>
          <p>Check back later for new items</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card modern">
              <div className="product-image-container">
                <img src={product.imageUrl} alt={product.name} className="product-image" />
                <div className="product-badge">New</div>
              </div>

              <div className="product-details">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">{product.description}</p>

                <div className="product-footer">
                  <div className="product-price">
                    <span className="currency">$</span>
                    <span className="amount">{product.price}</span>
                  </div>

                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={addingToCart === product.id}
                    className={`add-to-cart-btn ${addingToCart === product.id ? 'adding' : ''}`}
                  >
                    {addingToCart === product.id ? (
                      <>
                        <svg className="checkmark" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Added!
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                          <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;