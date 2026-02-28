import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      stock: ''
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      stock: product.stock
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Обновление существующего товара
        const response = await axios.patch(
          `http://localhost:3000/api/products/${editingProduct.id}`,
          formData
        );
        setProducts(products.map(p => 
          p.id === editingProduct.id ? response.data : p
        ));
      } else {
        // Создание нового товара
        const response = await axios.post('http://localhost:3000/api/products', formData);
        setProducts([...products, response.data]);
      }
      setShowModal(false);
    } catch (error) {
      alert('Ошибка сохранения');
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <h2>Загрузка товаров...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🛒 Интернет-магазин</h1>
        <button style={styles.addButton} onClick={openCreateModal}>
          + Добавить товар
        </button>
      </div>

      <div style={styles.grid}>
        {products.map(product => (
          <div key={product.id} style={styles.card}>
            <h3>{product.name}</h3>
            <p style={styles.category}>{product.category}</p>
            <p>{product.description}</p>
            <div style={styles.row}>
              <span style={styles.price}>{product.price} ₽</span>
              <span>В наличии: {product.stock}</span>
            </div>
            <div style={styles.buttons}>
              <button 
                style={styles.editButton}
                onClick={() => openEditModal(product)}
              >
                ✏️ Редактировать
              </button>
              <button 
                style={styles.deleteButton}
                onClick={() => handleDelete(product.id)}
              >
                🗑️ Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно для добавления/редактирования */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Название"
                value={formData.name}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Категория"
                value={formData.category}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <textarea
                name="description"
                placeholder="Описание"
                value={formData.description}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Цена"
                value={formData.price}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <input
                type="number"
                name="stock"
                placeholder="Количество"
                value={formData.stock}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.saveButton}>
                  Сохранить
                </button>
                <button 
                  type="button" 
                  style={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    background: '#0b0f19',
    color: 'white',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  addButton: {
    background: '#4ade80',
    color: '#0b0f19',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    border: '1px solid #333',
    borderRadius: '10px',
    padding: '15px',
    background: '#1a1f2e'
  },
  category: {
    color: '#888',
    fontSize: '14px'
  },
  price: {
    color: '#4ade80',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '10px 0'
  },
  buttons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  editButton: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    flex: 1
  },
  deleteButton: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    flex: 1
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    background: '#1a1f2e',
    padding: '20px',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '500px'
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    background: '#2a2f3e',
    border: '1px solid #333',
    color: 'white',
    borderRadius: '5px'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  saveButton: {
    background: '#4ade80',
    color: '#0b0f19',
    border: 'none',
    padding: '10px',
    borderRadius: '5px',
    cursor: 'pointer',
    flex: 1
  },
  cancelButton: {
    background: '#666',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '5px',
    cursor: 'pointer',
    flex: 1
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0b0f19',
    color: 'white'
  }
};

export default App;