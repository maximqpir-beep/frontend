import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    if (!window.confirm(`${isActive ? '🔴 ЗАБЛОКИРОВАТЬ' : '🟢 РАЗБЛОКИРОВАТЬ'} ПОЛЬЗОВАТЕЛЯ?`)) return;
    try {
      await api.updateUser(userId, { isActive: !isActive });
      loadUsers();
    } catch (err) {
      alert('❌ ОШИБКА ОБНОВЛЕНИЯ');
    }
  };

  const changeRole = async (userId, newRole) => {
    try {
      await api.updateUser(userId, { role: newRole });
      loadUsers();
    } catch (err) {
      alert('❌ ОШИБКА ИЗМЕНЕНИЯ РОЛИ');
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loading}>ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ...</div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👑 АДМИН-ПАНЕЛЬ</h2>
      <p style={styles.subtitle}>УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</p>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>EMAIL</th>
              <th style={styles.th}>ИМЯ</th>
              <th style={styles.th}>ФАМИЛИЯ</th>
              <th style={styles.th}>РОЛЬ</th>
              <th style={styles.th}>СТАТУС</th>
              <th style={styles.th}>ДЕЙСТВИЯ</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{
                ...styles.tableRow,
                backgroundColor: user.id === currentUser?.id ? 'rgba(74, 222, 128, 0.2)' : 'transparent'
              }}>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.first_name}</td>
                <td style={styles.td}>{user.last_name}</td>
                <td style={styles.td}>
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    disabled={user.id === currentUser?.id}
                    style={{
                      ...styles.select,
                      backgroundColor: user.role === 'admin' ? '#ff4444' :
                                     user.role === 'seller' ? '#ff8800' : '#4ade80'
                    }}
                  >
                    <option value="user">USER</option>
                    <option value="seller">SELLER</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.status,
                    color: user.isActive ? '#4ade80' : '#ff4444',
                    fontWeight: '900'
                  }}>
                    {user.isActive ? 'АКТИВЕН' : 'ЗАБЛОКИРОВАН'}
                  </span>
                </td>
                <td style={styles.td}>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      style={user.isActive ? styles.blockBtn : styles.unblockBtn}
                    >
                      {user.isActive ? 'ЗАБЛОКИРОВАТЬ' : 'РАЗБЛОКИРОВАТЬ'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    padding: '40px', 
    maxWidth: '1300px', 
    margin: '0 auto' 
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '500px'
  },
  loading: { 
    color: '#4ade80', 
    fontSize: '24px',
    background: '#111111',
    padding: '30px 60px',
    borderRadius: '15px',
    border: '3px solid #4ade80',
    fontWeight: '900',
    letterSpacing: '2px'
  },
  title: {
    color: '#4ade80',
    fontSize: '42px',
    fontWeight: '900',
    marginBottom: '10px',
    letterSpacing: '2px'
  },
  subtitle: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '40px'
  },
  tableContainer: {
    background: '#111111',
    borderRadius: '20px',
    padding: '30px',
    border: '3px solid #4ade80',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    color: '#ffffff'
  },
  tableHeader: {
    borderBottom: '3px solid #4ade80'
  },
  th: {
    textAlign: 'left',
    padding: '15px',
    color: '#4ade80',
    fontWeight: '900',
    fontSize: '16px',
    letterSpacing: '1px'
  },
  tableRow: {
    borderBottom: '1px solid #333'
  },
  td: {
    padding: '15px',
    fontWeight: '500',
    fontSize: '15px'
  },
  select: {
    padding: '8px 15px',
    color: '#000000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '900',
    fontSize: '14px',
    cursor: 'pointer'
  },
  status: {
    fontWeight: '900',
    fontSize: '14px'
  },
  blockBtn: {
    background: '#ff4444',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '900',
    fontSize: '13px',
    letterSpacing: '1px'
  },
  unblockBtn: {
    background: '#4ade80',
    color: '#000000',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '900',
    fontSize: '13px',
    letterSpacing: '1px'
  }
};