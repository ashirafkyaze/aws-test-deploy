const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');

describe('Product Endpoints', () => {
  let token;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Register and login to get token
    await request(app)
      .post('/auth/register')
      .send({
        name: 'Product Test',
        email: 'product@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'product@example.com',
        password: 'password123'
      });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Product',
          description: 'A test product',
          price: 10.99,
          imageUrl: 'http://example.com/image.jpg'
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Product');
    });
  });

  describe('GET /products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /products/:id', () => {
    let productId;

    beforeAll(async () => {
      const createResponse = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Get Product',
          price: 5.99
        });
      productId = createResponse.body.id;
    });

    it('should get a product by id', async () => {
      const response = await request(app)
        .get(`/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Get Product');
    });
  });

  describe('PUT /products/:id', () => {
    let productId;

    beforeAll(async () => {
      const createResponse = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Update Product',
          price: 15.99
        });
      productId = createResponse.body.id;
    });

    it('should update a product', async () => {
      const response = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Product',
          price: 20.99
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Product');
    });
  });

  describe('DELETE /products/:id', () => {
    let productId;

    beforeAll(async () => {
      const createResponse = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Delete Product',
          price: 25.99
        });
      productId = createResponse.body.id;
    });

    it('should delete a product', async () => {
      const response = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Product deleted successfully');
    });
  });
});