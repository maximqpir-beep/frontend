import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>🔐 ВХОД В СИСТЕМУ</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <div style={styles.field}>
          <label style={styles.label}>EMAIL:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="user@example.com"
          />
        </div>
        
        <div style={styles.field}>
          <label style={styles.label}>ПАРОЛЬ:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="********"
          />
        </div>
        
        <button type="submit" style={styles.button}>ВОЙТИ</button>
        
        <p style={styles.link}>
          Нет аккаунта? <a href="/register" style={styles.linkA}>ЗАРЕГИСТРИРОВАТЬСЯ</a>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { 
    maxWidth: '500px', 
    margin: '80px auto', 
    padding: '20px' 
  },
  form: { 
    background: '#111111', 
    padding: '50px', 
    borderRadius: '20px',
    border: '3px solid #4ade80'
  },
  title: { 
    color: '#4ade80', 
    marginBottom: '30px', 
    textAlign: 'center',
    fontSize: '32px',
    fontWeight: '900',
    letterSpacing: '2px'
  },
  field: { 
    marginBottom: '25px' 
  },
  label: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: '16px',
    display: 'block',
    marginBottom: '8px'
  },
  input: { 
    width: '100%', 
    padding: '15px', 
    background: '#000000', 
    border: '2px solid #333', 
    color: '#ffffff', 
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: '500'
  },
  button: { 
    width: '100%', 
    padding: '18px', 
    background: '#4ade80', 
    color: '#000000', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: '900',
    fontSize: '20px',
    marginTop: '20px',
    letterSpacing: '2px'
  },
  error: { 
    background: '#ff4444', 
    color: '#ffffff', 
    padding: '15px', 
    borderRadius: '10px', 
    marginBottom: '25px',
    fontWeight: '700',
    fontSize: '16px',
    textAlign: 'center'
  },
  link: { 
    textAlign: 'center', 
    marginTop: '25px', 
    color: '#888',
    fontSize: '16px'
  },
  linkA: {
    color: '#4ade80',
    fontWeight: '900',
    textDecoration: 'none',
    marginLeft: '5px'
  }
};