const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Раздаём статические файлы:
// 1. Из папки public (копия фронтенда из pr1)
app.use(express.static(path.join(__dirname, 'public')));
// 2. CSS файлы из pr1 (чтобы стили работали)
app.use('/css', express.static(path.join(__dirname, '../pr1/css')));

// Подключаем маршруты для товаров
const productRoutes = require('./routes/products');
app.use('/', productRoutes);

// Главная страница — отдаём наш HTML из public
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(port, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${port}`);
    console.log(`📦 API товаров: http://localhost:${port}/products`);
    console.log(`🖥️  Фронтенд: http://localhost:${port}/`);
});