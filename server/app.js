const express = require('express');
const app = express();
const port = 3000;

// "База данных" в памяти
let products = [
  { id: 1, name: 'Клубника Абхазская', price: 350 }, 
  { id: 2, name: 'Черешня', price: 400 },
  { id: 3, name: 'Малина', price: 300 }
];

// Middleware для парсинга JSON
app.use(express.json());

// Главная
app.get('/', (req, res) => {
  res.send('API товаров');
});

// CREATE – добавить товар
app.post('/products', (req, res) => {
  const { name, price } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name и price обязательны' });
  }

  const newProduct = {
    id: Date.now(),
    name,
    price
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// READ – все товары
app.get('/products', (req, res) => {
  res.json(products);
});

// READ – товар по id
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  res.json(product);
});

// UPDATE – частичное обновление
app.patch('/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  const { name, price } = req.body;

  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;

  res.json(product);
});

// DELETE – удалить товар
app.delete('/products/:id', (req, res) => {
  const exists = products.some(p => p.id == req.params.id);

  if (!exists) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  products = products.filter(p => p.id != req.params.id);
  res.send('Ok');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
