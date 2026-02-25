const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const app = express();
const port = 3000;

// Начальные данные (10 товаров)
let products = [
  { id: nanoid(6), name: 'Ноутбук ASUS ROG', category: 'Ноутбуки', description: 'Игровой ноутбук с RTX 3060', price: 95000, stock: 5 },
  { id: nanoid(6), name: 'Смартфон iPhone 15', category: 'Смартфоны', description: '128GB, черный', price: 89000, stock: 8 },
  { id: nanoid(6), name: 'Наушники Sony WH-1000XM5', category: 'Аксессуары', description: 'Беспроводные, шумоподавление', price: 25000, stock: 12 },
  { id: nanoid(6), name: 'Монитор Samsung 27"', category: 'Мониторы', description: '4K, IPS, 144Hz', price: 32000, stock: 3 },
  { id: nanoid(6), name: 'Клавиатура Logitech MX Keys', category: 'Аксессуары', description: 'Беспроводная, подсветка', price: 9000, stock: 15 },
  { id: nanoid(6), name: 'Мышь Razer DeathAdder V3', category: 'Аксессуары', description: 'Проводная, 30000 DPI', price: 6000, stock: 20 },
  { id: nanoid(6), name: 'Планшет iPad Air', category: 'Планшеты', description: '64GB, Wi-Fi', price: 45000, stock: 7 },
  { id: nanoid(6), name: 'SSD Samsung 1TB', category: 'Комплектующие', description: 'NVMe M.2', price: 8000, stock: 25 },
  { id: nanoid(6), name: 'Видеокарта RTX 4070', category: 'Комплектующие', description: '12GB, GDDR6', price: 65000, stock: 2 },
  { id: nanoid(6), name: 'Принтер HP LaserJet', category: 'Оргтехника', description: 'Черно-белый, лазерный', price: 15000, stock: 4 }
];

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Логирование запросов
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
  });
  next();
});

// Функция-помощник для поиска товара
function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

// ========== CRUD маршруты ==========

// GET /api/products — все товары
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id — товар по ID
app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
});

// POST /api/products — создать товар
app.post('/api/products', (req, res) => {
  const { name, category, description, price, stock } = req.body;

  if (!name || !category || !description || price === undefined || stock === undefined) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock)
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PATCH /api/products/:id — обновить товар
app.patch('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  const { name, category, description, price, stock } = req.body;

  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);

  res.json(product);
});

// DELETE /api/products/:id — удалить товар
app.delete('/api/products/:id', (req, res) => {
  const exists = products.some(p => p.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Product not found" });

  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

// 404 для всех остальных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`🚀 Shop backend running on http://localhost:${port}`);
});