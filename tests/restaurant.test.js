const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const authRes = await request(app).post('/api/auth/register').send({
    username: 'foodie',
    email: 'foodie@test.com',
    password: 'password123',
    preferences: { dietary: ['Vegan'] }
  });
  token = authRes.body.token;

  await Restaurant.create({
    name: 'Vegan Delight',
    cuisine: 'Health',
    dietaryTags: ['Vegan'],
    location: { type: 'Point', coordinates: [0, 0] }
  });
  
  await Restaurant.create({
    name: 'Steakhouse',
    cuisine: 'American',
    dietaryTags: ['Meat-Lover'],
    location: { type: 'Point', coordinates: [0, 0] }
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Restaurant API Endpoints', () => {

  it('should return restaurants matching the search query', async () => {
    const res = await request(app).get('/api/restaurants/search?query=Vegan');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Vegan Delight');
  });

  it('should return personalized recommendations based on user diet', async () => {
    const res = await request(app)
      .get('/api/restaurants/recommendations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    const names = res.body.results.map(r => r.name);
    expect(names).toContain('Vegan Delight');
    expect(names).not.toContain('Steakhouse');
  });

  it('should block access to recommendations without a token', async () => {
    const res = await request(app).get('/api/restaurants/recommendations');
    expect(res.statusCode).toEqual(401); // 401 Unauthorized
  });

  it('should allow user to add a favorite', async () => {
    const resto = await Restaurant.findOne({ name: 'Vegan Delight' });
    
    const res = await request(app)
      .post(`/api/restaurants/favorite/${resto._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('Added to favorites');
  });
});