const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

const searchRestaurants = async (req, res) => {
  const { query } = req.query;
  try {
    const restaurants = await Restaurant.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { cuisine: { $regex: query, $options: 'i' } }
      ]
    });
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userDiets = user.preferences.dietary;

    let query = {};
    
    if (userDiets && userDiets.length > 0) {
      query = { dietaryTags: { $in: userDiets } };
    }

    const recommendations = await Restaurant.find(query).limit(10);
    
    res.status(200).json({
      user_preferences: userDiets,
      results: recommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addFavorite = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const user = await User.findById(req.user.id);

    // Prevent duplicates
    if (user.favorites.includes(restaurantId)) {
      return res.status(400).json({ message: 'Restaurant already in favorites' });
    }

    user.favorites.push(restaurantId);
    await user.save();

    res.status(200).json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchRestaurants,
  getRecommendations,
  addFavorite,
  getFavorites
};