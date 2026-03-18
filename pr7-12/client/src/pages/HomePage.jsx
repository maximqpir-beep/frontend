import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>🛍️ ДОБРО ПОЖАЛОВАТЬ В МАГАЗИН</h1>
        <p style={styles.subtitle}>React + Express + JWT + RBAC</p>
      </div>
      
      {isAuthenticated ? (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>👤 ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Имя:</span>
              <span style={styles.infoValue}>{user?.first_name} {user?.last_name}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Email:</span>
              <span style={styles.infoValue}>{user?.email}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Роль:</span>
              <span style={{
                ...styles.roleBadge,
                backgroundColor: user?.role === 'admin' ? '#ff4444' : 
                                user?.role === 'seller' ? '#ff8800' : '#4ade80'
              }}>
                {user?.role.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <p style={styles.welcomeText}>👋 ВОЙДИТЕ В СИСТЕМУ ДЛЯ РАБОТЫ С ТОВАРАМИ</p>
          <div style={styles.buttons}>
            <a href="/login" style={styles.primaryBtn}>ВОЙТИ</a>
            <a href="/register" style={styles.secondaryBtn}>РЕГИСТРАЦИЯ</a>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { 
    maxWidth: '1000px', 
    margin: '50px auto', 
    padding: '20px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '50px',
    padding: '40px',
    background: '#000000',
    borderRadius: '20px',
    border: '3px solid #4ade80'
  },
  title: { 
    color: '#4ade80', 
    fontSize: '42px',
    marginBottom: '15px',
    fontWeight: '900',
    letterSpacing: '2px'
  },
  subtitle: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '700'
  },
  card: { 
    background: '#111111', 
    padding: '40px', 
    borderRadius: '20px',
    border: '2px solid #4ade80',
  },
  cardTitle: {
    color: '#4ade80',
    marginBottom: '30px',
    fontSize: '28px',
    fontWeight: '900'
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    background: '#000000',
    borderRadius: '10px',
    border: '1px solid #333'
  },
  infoLabel: {
    width: '120px',
    color: '#888',
    fontWeight: '900',
    fontSize: '18px'
  },
  infoValue: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '18px'
  },
  roleBadge: {
    padding: '8px 24px',
    borderRadius: '30px',
    color: '#000000',
    fontWeight: '900',
    fontSize: '16px',
    letterSpacing: '1px'
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: '22px',
    marginBottom: '30px',
    fontWeight: '700',
    textAlign: 'center'
  },
  buttons: { 
    display: 'flex', 
    gap: '20px', 
    justifyContent: 'center'
  },
  primaryBtn: { 
    background: '#4ade80', 
    color: '#000000', 
    padding: '15px 40px', 
    borderRadius: '10px', 
    textDecoration: 'none',
    fontWeight: '900',
    fontSize: '18px',
    border: '3px solid #4ade80',
  },
  secondaryBtn: { 
    background: 'transparent', 
    color: '#4ade80', 
    padding: '15px 40px', 
    borderRadius: '10px', 
    textDecoration: 'none',
    fontWeight: '900',
    fontSize: '18px',
    border: '3px solid #4ade80',
  }
};