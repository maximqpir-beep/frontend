const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

// Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3005;

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
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

// Начальные данные (пользователи)
let users = [
  { id: nanoid(6), name: 'Петр', age: 16 },
  { id: nanoid(6), name: 'Иван', age: 18 },
  { id: nanoid(6), name: 'Дарья', age: 20 },
];

// ========== SWAGGER КОНФИГУРАЦИЯ ==========

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - age
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный уникальный ID пользователя
 *         name:
 *           type: string
 *           description: Имя пользователя
 *         age:
 *           type: integer
 *           description: Возраст пользователя
 *       example:
 *         id: "abc123"
 *         name: "Петр"
 *         age: 25
 */

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API управления пользователями',
      version: '1.0.0',
      description: 'Простое API для управления пользователями с документацией Swagger',
      contact: {
        url: 'http://localhost:3005',
      },
    },
    servers: [
      {
        url: `http://localhost:${port}/api`,
        description: 'Локальный сервер',
      },
    ],
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Подключаем Swagger UI по адресу /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

/**
 * Поиск пользователя по ID
 * @param {string} id - ID пользователя
 * @param {object} res - объект ответа Express
 * @returns {object|null} - найденный пользователь или null
 */
function findUserOr404(id, res) {
  const user = users.find(u => u.id === id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return null;
  }
  return user;
}

// ========== CRUD МАРШРУТЫ С ДОКУМЕНТАЦИЕЙ ==========

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Создает нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *                 description: Имя пользователя
 *               age:
 *                 type: integer
 *                 description: Возраст пользователя
 *             example:
 *               name: "Анна"
 *               age: 22
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации (не указаны имя или возраст)
 */
app.post("/api/users", (req, res) => {
  const { name, age } = req.body;

  if (!name || age === undefined) {
    return res.status(400).json({ error: "Name and age are required" });
  }

  const newUser = {
    id: nanoid(6),
    name: name.trim(),
    age: Number(age),
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Возвращает список всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get("/api/users", (req, res) => {
  res.json(users);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Получает пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 */
app.get("/api/users/:id", (req, res) => {
  const id = req.params.id;
  const user = findUserOr404(id, res);
  if (!user) return;
  res.json(user);
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Обновляет данные пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Новое имя
 *               age:
 *                 type: integer
 *                 description: Новый возраст
 *             example:
 *               name: "Петр Петров"
 *               age: 26
 *     responses:
 *       200:
 *         description: Обновленный пользователь
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Пользователь не найден
 */
app.patch("/api/users/:id", (req, res) => {
  const id = req.params.id;
  const user = findUserOr404(id, res);
  if (!user) return;

  if (req.body?.name === undefined && req.body?.age === undefined) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const { name, age } = req.body;
  if (name !== undefined) user.name = name.trim();
  if (age !== undefined) user.age = Number(age);

  res.json(user);
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Удаляет пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       204:
 *         description: Пользователь успешно удален (нет тела ответа)
 *       404:
 *         description: Пользователь не найден
 */
app.delete("/api/users/:id", (req, res) => {
  const id = req.params.id;

  const exists = users.some((u) => u.id === id);
  if (!exists) return res.status(404).json({ error: "User not found" });

  users = users.filter((u) => u.id !== id);
  res.status(204).send();
});

// ========== ОБРАБОТКА ОШИБОК ==========

// 404 для всех остальных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ========== ЗАПУСК СЕРВЕРА ==========

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger UI available at http://localhost:${port}/api-docs`);
});