import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import AdminPage from './pages/AdminPage';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isAdmin, isSeller } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (requiredRole === 'seller' && !isSeller) {
    return <Navigate to="/" />;
  }

  return children;
};

function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.navContainer}>
        <Link to="/" style={styles.logo}>🛒 SHOP</Link>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>ГЛАВНАЯ</Link>
          <Link to="/products" style={styles.link}>ТОВАРЫ</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" style={styles.link}>АДМИНКА</Link>
          )}
          {isAuthenticated ? (
            <>
              <span style={{
                ...styles.user,
                backgroundColor: user?.role === 'admin' ? '#ff4444' : 
                               user?.role === 'seller' ? '#ff8800' : '#4ade80'
              }}>
                {user?.first_name} ({user?.role})
              </span>
              <button onClick={logout} style={styles.logoutBtn}>ВЫЙТИ</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>ВХОД</Link>
              <Link to="/register" style={styles.link}>РЕГИСТРАЦИЯ</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

const styles = {
  nav: { 
    background: '#000000', 
    padding: '15px 0', 
    borderBottom: '3px solid #4ade80',
  },
  navContainer: { 
    maxWidth: '1300px', 
    margin: '0 auto', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '0 30px' 
  },
  logo: { 
    color: '#4ade80', 
    fontSize: '28px', 
    fontWeight: '900', 
    textDecoration: 'none',
    letterSpacing: '2px'
  },
  links: { 
    display: 'flex', 
    gap: '30px', 
    alignItems: 'center' 
  },
  link: { 
    color: '#ffffff', 
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '1px'
  },
  user: { 
    color: '#000000', 
    marginRight: '15px',
    fontWeight: '900',
    padding: '8px 16px',
    borderRadius: '30px',
    fontSize: '16px'
  },
  logoutBtn: { 
    background: '#ffffff', 
    color: '#000000', 
    border: '2px solid #ff4444', 
    padding: '8px 20px', 
    borderRadius: '30px', 
    cursor: 'pointer',
    fontWeight: '900',
    fontSize: '16px'
  }
};

export default App;