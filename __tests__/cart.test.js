const request = require('supertest');
const app = require('../server');
const sequelize = require('../config/database');

describe('Cart Endpoints', () => {
  let token;
  let productId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Register and login
    await request(app)
      .post('/auth/register')
      .send({
        name: 'Cart Test',
        email: 'cart@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'cart@example.com',
        password: 'password123'
      });

    token = loginResponse.body.token;

    // Create a product
    const productResponse = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cart Product',
        price: 10.99
      });

    productId = productResponse.body.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /cart', () => {
    it('should add item to cart', async () => {
      const response = await request(app)
        .post('/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId,
          quantity: 2
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item added to cart');
    });
  });

  describe('GET /cart', () => {
    it('should get cart contents', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
    });
  });

  describe('PUT /cart/:productId', () => {
    it('should update item quantity in cart', async () => {
      const response = await request(app)
        .put(`/cart/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          quantity: 3
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Quantity updated');
    });
  });

  describe('DELETE /cart/:productId', () => {
    it('should remove item from cart', async () => {
      const response = await request(app)
        .delete(`/cart/${productId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Product removed from cart');
    });
  });
});