const express = require('express');
const router = express.Router();
const {
  searchRestaurants,
  getRecommendations,
  addFavorite,
  getFavorites
} = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Food discovery and management
 */

/**
 * @swagger
 * /api/restaurants/search:
 *   get:
 *     summary: Search restaurants by name or cuisine
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term (e.g. "Vegan", "Pizza")
 *     responses:
 *       200:
 *         description: List of matching restaurants
 */
router.get('/search', searchRestaurants);

/**
 * @swagger
 * /api/restaurants/recommendations:
 *   get:
 *     summary: Get personalized recommendations based on dietary preferences
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommended restaurants
 *       401:
 *         description: Not authorized
 */
router.get('/recommendations', protect, getRecommendations);

/**
 * @swagger
 * /api/restaurants/favorites:
 *   get:
 *     summary: Get user favorite restaurants
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite restaurants
 */
router.get('/favorites', protect, getFavorites);

/**
 * @swagger
 * /api/restaurants/favorite/{id}:
 *   post:
 *     summary: Add a restaurant to favorites
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Added to favorites
 *       400:
 *         description: Already in favorites
 */
router.post('/favorite/:id', protect, addFavorite);

module.exports = router;
