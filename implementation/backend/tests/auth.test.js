const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Auth API Endpoints', () => {
  
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        preferences: { dietary: ['Vegan'] }
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toEqual('test@example.com');
  });

  it('should login an existing user', async () => {
    await User.create({
      username: 'loginuser',
      email: 'login@example.com',
      password: '$2a$10$testhashpasswordplaceholder',
    });
    
    await request(app).post('/api/auth/register').send({
      username: 'realuser',
      email: 'real@example.com',
      password: 'realpassword'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'real@example.com',
        password: 'realpassword'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'wrongpass',
      email: 'wrong@example.com',
      password: 'correctpassword'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(400);
  });
});