const express = require('express');
const router = express.Router();

// Начальный массив товаров
let products = [
    { id: 1, name: 'Ноутбук', price: 75000 },
    { id: 2, name: 'Смартфон', price: 45000 },
    { id: 3, name: 'Наушники', price: 5000 }
];

// CREATE (POST) — добавить новый товар
router.post('/products', (req, res) => {
    const { name, price } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ error: 'Необходимо указать name и price' });
    }

    const newProduct = {
        id: Date.now(),
        name,
        price
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// READ ALL (GET) — получить все товары
router.get('/products', (req, res) => {
    res.json(products);
});

// READ ONE (GET) — получить товар по id
router.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json(product);
});

// UPDATE (PATCH) — обновить товар по id
router.patch('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    const { name, price } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;

    res.json(product);
});

// DELETE (DELETE) — удалить товар по id
router.delete('/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id == req.params.id);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    products.splice(productIndex, 1);
    res.json({ message: 'Товар удалён' });
});

module.exports = router;