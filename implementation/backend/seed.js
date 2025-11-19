require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const User = require('./models/User');

const restaurants = [
  {
    name: "Northside Drafthouse",
    cuisine: "American/Bar",
    rating: 4.2,
    priceRange: "$$",
    dietaryTags: ["Late-Night", "Alcohol", "Meat-Lover"],
    location: { 
      type: "Point", 
      coordinates: [-96.7496, 32.9866], 
      address: "3000 Northside Blvd, Richardson, TX 75080" 
    }
  },
  {
    name: "Chick-fil-A (UTD Student Union)",
    cuisine: "Fast Food",
    rating: 4.8,
    priceRange: "$",
    dietaryTags: ["Meat-Lover", "Chicken"],
    location: { 
      type: "Point", 
      coordinates: [-96.7502, 32.9857], 
      address: "800 W Campbell Rd, Richardson, TX 75080" 
    }
  },
  {
    name: "Halal Shack (UTD Student Union)",
    cuisine: "Middle Eastern",
    rating: 4.0,
    priceRange: "$",
    dietaryTags: ["Halal", "Rice-Bowl"],
    location: { 
      type: "Point", 
      coordinates: [-96.7502, 32.9857], 
      address: "800 W Campbell Rd, Richardson, TX 75080" 
    }
  },
  {
    name: "American Tap Room (Northside)",
    cuisine: "Gastropub",
    rating: 4.3,
    priceRange: "$$",
    dietaryTags: ["Alcohol", "Late-Night"],
    location: { 
      type: "Point", 
      coordinates: [-96.7510, 32.9870], 
      address: "3000 Northside Blvd, Richardson, TX 75080" 
    }
  },
  {
    name: "Starbucks (UTD)",
    cuisine: "Coffee",
    rating: 4.5,
    priceRange: "$$",
    dietaryTags: ["Vegetarian", "Sweet", "Breakfast"],
    location: { 
      type: "Point", 
      coordinates: [-96.7485, 32.9860], 
      address: "800 W Campbell Rd, Richardson, TX 75080" 
    }
  },
  {
    name: "Torchy's Tacos",
    cuisine: "Tex-Mex",
    rating: 4.6,
    priceRange: "$$",
    dietaryTags: ["Spicy", "Vegetarian-Friendly", "Tacos"],
    location: { 
      type: "Point", 
      coordinates: [-96.7357, 32.9852], 
      address: "501 W Campbell Rd, Richardson, TX 75080" 
    }
  },
  {
    name: "Velvet Taco",
    cuisine: "Fusion Tacos",
    rating: 4.5,
    priceRange: "$$",
    dietaryTags: ["Late-Night", "Fusion", "Gluten-Free"],
    location: { 
      type: "Point", 
      coordinates: [-96.7330, 32.9856], 
      address: "102 W Campbell Rd, Richardson, TX 75080" 
    }
  },
  {
    name: "Masala Wok",
    cuisine: "Asian Fusion",
    rating: 4.1,
    priceRange: "$$",
    dietaryTags: ["Halal", "Spicy", "Vegetarian", "Vegan"],
    location: { 
      type: "Point", 
      coordinates: [-96.7692, 32.9837], 
      address: "1310 W Campbell Rd, Richardson, TX 75080" 
    }
  },
  {
    name: "Sweet Daze Dessert Bar",
    cuisine: "Dessert",
    rating: 4.7,
    priceRange: "$",
    dietaryTags: ["Sweet", "Vegetarian", "Ice-Cream"],
    location: { 
      type: "Point", 
      coordinates: [-96.7565, 32.9838], 
      address: "581 W Campbell Rd, Richardson, TX 75080" 
    }
  },
  {
    name: "Fat Straws Bubble Tea",
    cuisine: "Beverage",
    rating: 4.8,
    priceRange: "$",
    dietaryTags: ["Sweet", "Vegan", "Gluten-Free"],
    location: { 
      type: "Point", 
      coordinates: [-96.7549, 32.9835], 
      address: "520 W Campbell Rd, Richardson, TX 75080" 
    }
  },
  {
    name: "Salata",
    cuisine: "Salad",
    rating: 4.6,
    priceRange: "$$",
    dietaryTags: ["Healthy", "Vegan", "Gluten-Free", "Vegetarian"],
    location: { 
      type: "Point", 
      coordinates: [-96.7614, 32.9832], 
      address: "1230 W Campbell Rd, Richardson, TX 75080" 
    }
  },
  {
    name: "Piada Italian Street Food",
    cuisine: "Italian",
    rating: 4.4,
    priceRange: "$$",
    dietaryTags: ["Pasta", "Vegetarian"],
    location: { 
      type: "Point", 
      coordinates: [-96.7612, 32.9832], 
      address: "1230 W Campbell Rd, Richardson, TX 75080" 
    }
  },
  {
    name: "The Halal Guys",
    cuisine: "Middle Eastern",
    rating: 4.4,
    priceRange: "$",
    dietaryTags: ["Halal", "Rice-Bowl", "Spicy"],
    location: { 
      type: "Point", 
      coordinates: [-96.7689, 32.9537], 
      address: "101 S Coit Rd, Richardson, TX 75080" 
    }
  },
  {
    name: "Ricky's Hot Chicken",
    cuisine: "Nashville Hot Chicken",
    rating: 4.7,
    priceRange: "$$",
    dietaryTags: ["Halal", "Spicy", "Meat-Lover"],
    location: { 
      type: "Point", 
      coordinates: [-96.7400, 32.9470], 
      address: "100 S Central Expy, Richardson, TX 75080" 
    }
  },
  {
    name: "Jeng Chi",
    cuisine: "Chinese/Dumplings",
    rating: 4.6,
    priceRange: "$$",
    dietaryTags: ["Dumplings", "Meat-Lover", "Comfort-Food"],
    location: { 
      type: "Point", 
      coordinates: [-96.7120, 32.9470], 
      address: "400 N Greenville Ave, Richardson, TX 75081" 
    }
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    await Restaurant.deleteMany();
    console.log('Old restaurant data cleared.');

    await Restaurant.insertMany(restaurants);
    console.log('Imported 15 UTD-area restaurants successfully!');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();