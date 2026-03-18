const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { authMiddleware, ACCESS_SECRET, REFRESH_SECRET } = require('./middleware/auth');
const roleMiddleware = require('./middleware/roles');

const app = express();
const port = 3000;

// Настройки токенов
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// Хранилища
let users = [];
let refreshTokens = new Set();

// ========== НАЧАЛЬНЫЕ ТОВАРЫ (10 штук) ==========
let products = [
  { id: nanoid(6), title: 'Ноутбук ASUS ROG', category: 'Ноутбуки', description: 'Игровой ноутбук с RTX 3060, 16GB RAM, 512GB SSD', price: 95000 },
  { id: nanoid(6), title: 'Смартфон iPhone 15', category: 'Смартфоны', description: '128GB, черный, A16 Bionic', price: 89000 },
  { id: nanoid(6), title: 'Наушники Sony WH-1000XM5', category: 'Аксессуары', description: 'Беспроводные, шумоподавление, 30ч работы', price: 25000 },
  { id: nanoid(6), title: 'Монитор Samsung 27"', category: 'Мониторы', description: '4K, IPS, 144Hz, HDR400', price: 32000 },
  { id: nanoid(6), title: 'Клавиатура Logitech MX Keys', category: 'Аксессуары', description: 'Беспроводная, подсветка, для Mac/Windows', price: 9000 },
  { id: nanoid(6), title: 'Мышь Razer DeathAdder V3', category: 'Аксессуары', description: 'Проводная, 30000 DPI, оптическая', price: 6000 },
  { id: nanoid(6), title: 'Планшет iPad Air', category: 'Планшеты', description: '64GB, Wi-Fi, M1 chip, 10.9"', price: 45000 },
  { id: nanoid(6), title: 'SSD Samsung 1TB', category: 'Комплектующие', description: 'NVMe M.2, 3500MB/s', price: 8000 },
  { id: nanoid(6), title: 'Видеокарта RTX 4070', category: 'Комплектующие', description: '12GB, GDDR6, DLSS 3', price: 65000 },
  { id: nanoid(6), title: 'Принтер HP LaserJet', category: 'Оргтехника', description: 'Черно-белый, лазерный, 20 стр/мин', price: 15000 }
];

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

// Логирование (более контрастное)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // красный для ошибок, зелёный для успеха
    console.log(`${statusColor}[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path} - ${duration}ms\x1b[0m`);
  });
  next();
});

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

function findUserById(id) {
  return users.find(u => u.id === id);
}

function findProductById(id) {
  return products.find(p => p.id === id);
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// ========== МАРШРУТЫ АУТЕНТИФИКАЦИИ ==========

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  console.log('\x1b[36m📝 Регистрация нового пользователя\x1b[0m');
  const { email, first_name, last_name, password } = req.body;

  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ error: '❌ Все поля обязательны' });
  }

  if (findUserByEmail(email)) {
    return res.status(400).json({ error: '❌ Email уже существует' });
  }

  const hashedPassword = await hashPassword(password);
  
  // Первый пользователь — admin, остальные — user
  const role = users.length === 0 ? 'admin' : 'user';

  const newUser = {
    id: nanoid(6),
    email,
    first_name,
    last_name,
    role,
    hashedPassword,
    isActive: true
  };

  users.push(newUser);
  console.log(`\x1b[32m✅ Пользователь ${email} создан с ролью ${role}\x1b[0m`);

  const { hashedPassword: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  console.log('\x1b[36m🔐 Попытка входа\x1b[0m');
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '❌ Email и пароль обязательны' });
  }

  const user = findUserByEmail(email);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: '❌ Неверные учетные данные' });
  }

  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) {
    return res.status(401).json({ error: '❌ Неверные учетные данные' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  refreshTokens.add(refreshToken);

  const { hashedPassword: _, ...userWithoutPassword } = user;
  
  console.log(`\x1b[32m✅ Успешный вход: ${email} (${user.role})\x1b[0m`);
  res.json({
    accessToken,
    refreshToken,
    user: userWithoutPassword
  });
});

// Обновление токенов
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: '❌ refreshToken обязателен' });
  }

  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: '❌ Невалидный refresh-токен' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = findUserById(payload.sub);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: '❌ Пользователь не найден или заблокирован' });
    }

    refreshTokens.delete(refreshToken);
    
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.add(newRefreshToken);

    console.log(`\x1b[32m🔄 Токены обновлены для ${user.email}\x1b[0m`);
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    return res.status(401).json({ error: '❌ Невалидный или истекший refresh-токен' });
  }
});

// Текущий пользователь
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = findUserById(req.user.sub);
  if (!user) {
    return res.status(404).json({ error: '❌ Пользователь не найден' });
  }

  const { hashedPassword, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (только admin) ==========
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  console.log(`\x1b[35m👑 Админ ${req.user.email} запросил список пользователей\x1b[0m`);
  const usersWithoutPasswords = users.map(({ hashedPassword, ...user }) => user);
  res.json(usersWithoutPasswords);
});

app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: '❌ Пользователь не найден' });
  }

  const { hashedPassword, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: '❌ Пользователь не найден' });
  }

  if (user.id === req.user.sub && req.body.role && req.body.role !== user.role) {
    return res.status(403).json({ error: '❌ Нельзя изменить свою собственную роль' });
  }

  const { first_name, last_name, role, isActive } = req.body;

  if (first_name !== undefined) user.first_name = first_name;
  if (last_name !== undefined) user.last_name = last_name;
  if (role !== undefined && ['user', 'seller', 'admin'].includes(role)) {
    user.role = role;
  }
  if (isActive !== undefined) user.isActive = isActive;

  console.log(`\x1b[35m👑 Админ ${req.user.email} обновил пользователя ${user.email}\x1b[0m`);

  const { hashedPassword, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: '❌ Пользователь не найден' });
  }

  if (user.id === req.user.sub) {
    return res.status(403).json({ error: '❌ Нельзя заблокировать самого себя' });
  }

  user.isActive = false;
  console.log(`\x1b[35m👑 Админ ${req.user.email} заблокировал пользователя ${user.email}\x1b[0m`);
  res.json({ message: '✅ Пользователь заблокирован', id: user.id });
});

// ========== УПРАВЛЕНИЕ ТОВАРАМИ ==========

// Создать товар (seller, admin)
app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const { title, category, description, price } = req.body;

  if (!title || !category || !description || price === undefined) {
    return res.status(400).json({ error: '❌ Все поля обязательны' });
  }

  const newProduct = {
    id: nanoid(6),
    title,
    category,
    description,
    price: Number(price)
  };

  products.push(newProduct);
  console.log(`\x1b[33m📦 ${req.user.role} ${req.user.email} создал товар: ${title}\x1b[0m`);
  res.status(201).json(newProduct);
});

// Список товаров
app.get('/api/products', authMiddleware, (req, res) => {
  console.log(`\x1b[34m📋 ${req.user.email} запросил список товаров (всего: ${products.length})\x1b[0m`);
  res.json(products);
});

// Товар по ID
app.get('/api/products/:id', authMiddleware, (req, res) => {
  const product = findProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: '❌ Товар не найден' });
  }
  res.json(product);
});

// Обновить товар (seller, admin)
app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const product = findProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: '❌ Товар не найден' });
  }

  const { title, category, description, price } = req.body;
  if (!title || !category || !description || price === undefined) {
    return res.status(400).json({ error: '❌ Все поля обязательны' });
  }

  product.title = title;
  product.category = category;
  product.description = description;
  product.price = Number(price);

  console.log(`\x1b[33m✏️ ${req.user.role} ${req.user.email} обновил товар: ${title}\x1b[0m`);
  res.json(product);
});

// Удалить товар (только admin)
app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '❌ Товар не найден' });
  }

  const deletedProduct = products[index];
  products.splice(index, 1);
  
  console.log(`\x1b[31m🗑️ Админ ${req.user.email} удалил товар: ${deletedProduct.title}\x1b[0m`);
  res.status(204).send();
});

// ========== ЗАПУСК ==========
app.listen(port, () => {
  console.log('\x1b[42m\x1b[30m', '='.repeat(60), '\x1b[0m');
  console.log('\x1b[42m\x1b[30m', '🚀 PR7-12 SERVER ЗАПУЩЕН', '\x1b[0m');
  console.log('\x1b[42m\x1b[30m', `📡 Порт: ${port}`, '\x1b[0m');
  console.log('\x1b[42m\x1b[30m', `📦 Товаров: ${products.length}`, '\x1b[0m');
  console.log('\x1b[42m\x1b[30m', '👥 Роли: guest, user, seller, admin', '\x1b[0m');
  console.log('\x1b[42m\x1b[30m', '='.repeat(60), '\x1b[0m');
  console.log('\x1b[33m%s\x1b[0m', '🔗 http://localhost:3000');
  console.log('\x1b[36m%s\x1b[0m', '👑 Первый пользователь = admin');
});