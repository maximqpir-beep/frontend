import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/products');
      console.log('Товары:', response.data);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка:', error);
      setLoading(false);
    }
  };

  if (loading) return <div style={{color: 'white', background: '#0b0f19', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Загрузка...</div>;

  return (
    <div style={{background: '#0b0f19', color: 'white', minHeight: '100vh', padding: '20px'}}>
      <h1 style={{textAlign: 'center'}}>🛒 Интернет-магазин</h1>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
        {products.map(product => (
          <div key={product.id} style={{border: '1px solid #333', borderRadius: '10px', padding: '15px', background: '#1a1f2e'}}>
            <h3>{product.name}</h3>
            <p style={{color: '#888'}}>{product.category}</p>
            <p>{product.description}</p>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px'}}>
              <span style={{color: '#4ade80', fontSize: '20px'}}>{product.price} ₽</span>
              <span>В наличии: {product.stock}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;