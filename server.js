require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Initialize Express app
const app = express();

app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static('client/dist'));

// JWT verification middleware
const authenticateToken = (req, res, next) => {
   const authHeader = req.header('Authorization');
   console.log('Auth header:', authHeader);
   const token = authHeader?.split(' ')[1];
   console.log('Token:', token);
   if (!token) return res.status(401).json({ error: 'Access denied' });
   jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
     if (err) {
       console.log('JWT verify error:', err);
       return res.status(403).json({ error: 'Invalid token' });
     }
     req.user = user;
     next();
   });
 };

// Connect to database
sequelize.authenticate()
  .then(() => {
    console.log('Database connected.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Sync database
sequelize.sync()
  .then(() => {
    console.log('Database synced.');
    addSampleProducts();
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });

// Add sample products if none exist
async function addSampleProducts() {
  try {
    const count = await Product.count();
    if (count === 0) {
      const sampleProducts = [
        {
          name: 'Wireless Bluetooth Headphones',
          description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
          price: 99.99,
          imageUrl: 'https://picsum.photos/300/200?random=1'
        },
        {
          name: 'Smartphone Case',
          description: 'Protective case for smartphones with anti-slip grip and card holder.',
          price: 19.99,
          imageUrl: 'https://picsum.photos/300/200?random=2'
        },
        {
          name: 'Laptop Stand',
          description: 'Adjustable laptop stand for better ergonomics and cooling.',
          price: 49.99,
          imageUrl: 'https://picsum.photos/300/200?random=3'
        },
        {
          name: 'USB-C Cable',
          description: 'Fast charging USB-C cable, 6 feet long with braided design.',
          price: 14.99,
          imageUrl: 'https://picsum.photos/300/200?random=4'
        },
        {
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse with customizable buttons and RGB lighting.',
          price: 29.99,
          imageUrl: 'https://picsum.photos/300/200?random=5'
        },
        {
          name: 'Portable Charger',
          description: '10000mAh power bank with fast charging and multiple USB ports.',
          price: 39.99,
          imageUrl: 'https://picsum.photos/300/200?random=6'
        }
      ];

      await Product.bulkCreate(sampleProducts);
      console.log('Sample products added.');
    }
  } catch (error) {
    console.error('Error adding sample products:', error);
  }
}

// Define the port from environment variable or default to 3000
const port = process.env.PORT || 3000;

// Root route - serve the React app
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/dist/index.html');
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/client/dist/index.html');
});

// Status route for health checks
app.get('/status', (req, res) => {
  res.json({ status: 'OK' });
});

// Info route to provide server information
app.get('/info', (req, res) => {
  res.json({
    message: 'AWS Test App Server',
    version: '1.0.0',
    port: port,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth routes
app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret');
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Product routes
app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/products', authenticateToken, async (req, res) => {
  const { name, description, price, imageUrl } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  try {
    const product = await Product.create({ name, description, price, imageUrl });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/products/:id', authenticateToken, async (req, res) => {
  const { name, description, price, imageUrl } = req.body;
  if (name !== undefined && !name) {
    return res.status(400).json({ error: 'Name cannot be empty' });
  }
  if (price !== undefined && (isNaN(price) || price < 0)) {
    return res.status(400).json({ error: 'Price must be a valid positive number' });
  }
  try {
    const [affectedRows] = await Product.update({ name, description, price, imageUrl }, { where: { id: req.params.id } });
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const updatedProduct = await Product.findByPk(req.params.id);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/products/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Cart routes
app.get('/cart', authenticateToken, async (req, res) => {
  console.log('GET /cart → user:', req.user.id);

  try {
    let cart = await Order.findOne({
      where: { userId: parseInt(req.user.id), status: 'cart' }
    });

    console.log('Cart found:', cart ? cart.id : 'none');

    if (!cart) {
      return res.json({ products: [], total: 0 });
    }

    const productsWithDetails = [];
    let total = 0;

    for (const item of cart.products) {
      console.log('Processing cart item:', item);

      const product = await Product.findByPk(item.productId);
      if (product) {
        productsWithDetails.push({
          ...product.toJSON(),
          productId: item.productId,
          quantity: item.quantity
        });

        const lineTotal = parseFloat(product.price) * item.quantity;
        total += lineTotal;

        console.log(`Added ${product.name}:`, lineTotal);
      }
    }

    cart.total = total;
    await cart.save();

    console.log('Cart total updated:', total);

    res.json({ products: productsWithDetails, total });
  } catch (error) {
    console.error('GET /cart error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/cart', authenticateToken, async (req, res) => {
  const productId = parseInt(req.body.productId);
  const quantity = parseInt(req.body.quantity);

  console.log('POST /cart → user:', req.user.id, 'product:', productId, 'qty:', quantity);

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Valid productId and quantity > 0 required' });
  }

  try {
    const product = await Product.findByPk(productId);
    console.log('Product lookup:', product ? product.name : 'not found');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let cart = await Order.findOne({
      where: { userId: parseInt(req.user.id), status: 'cart' }
    });

    if (!cart) {
      console.log('Creating new cart');

      await Order.create({
        userId: parseInt(req.user.id),
        products: [{ productId, quantity }],
        total: parseFloat(product.price) * quantity,
        status: 'cart'
      });

      return res.json({ message: 'Item added to cart' });
    }

    const existingItem = cart.products.find(item => item.productId == productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      console.log('Updated existing item quantity:', existingItem.quantity);
    } else {
      cart.products.push({ productId, quantity });
      console.log('Added new item to cart');
    }

    let total = 0;
    for (const item of cart.products) {
      const prod = await Product.findByPk(item.productId);
      if (prod) {
        total += parseFloat(prod.price) * item.quantity;
      }
    }

    cart.total = total;
    cart.changed('products', true);
    await cart.save();

    console.log('Cart saved. New total:', total);

    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('POST /cart error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/cart/:productId', authenticateToken, async (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.productId;

  console.log('PUT /cart → user:', req.user.id, 'product:', productId, 'qty:', quantity);

  if (!quantity || quantity <= 0) {
    console.log('Invalid quantity:', quantity);
    return res.status(400).json({ error: 'Quantity must be > 0' });
  }

  try {
    let cart = await Order.findOne({
      where: { userId: req.user.id, status: 'cart' }
    });

    console.log('Cart found:', cart ? cart.id : 'none');

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = cart.products.find(item => item.productId == productId);
    console.log('Item in cart:', item);

    if (!item) {
      return res.status(404).json({ error: 'Product not in cart' });
    }

    item.quantity = quantity;

    let total = 0;
    for (const it of cart.products) {
      const prod = await Product.findByPk(it.productId);
      if (prod) {
        total += parseFloat(prod.price) * it.quantity;
      }
    }

    cart.total = total;
    cart.changed('products', true);
    await cart.save();

    console.log('Quantity updated. New total:', total);

    res.json({ message: 'Quantity updated' });
  } catch (error) {
    console.error('PUT /cart error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/cart/:productId', authenticateToken, async (req, res) => {
  const productId = req.params.productId;

  console.log('DELETE /cart → user:', req.user.id, 'product:', productId);

  try {
    let cart = await Order.findOne({
      where: { userId: req.user.id, status: 'cart' }
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const index = cart.products.findIndex(item => item.productId == productId);
    console.log('Item index:', index);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not in cart' });
    }

    cart.products.splice(index, 1);

    let total = 0;
    for (const it of cart.products) {
      const prod = await Product.findByPk(it.productId);
      if (prod) {
        total += parseFloat(prod.price) * it.quantity;
      }
    }

    cart.total = total;
    cart.changed('products', true);
    await cart.save();

    console.log('Item removed. New total:', total);

    res.json({ message: 'Product removed from cart' });
  } catch (error) {
    console.error('DELETE /cart error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});


// Payment routes
app.post('/create-payment-intent', authenticateToken, async (req, res) => {
  console.log('POST /create-payment-intent → user:', req.user.id);

  if (!stripe) {
    console.error('Stripe not configured');
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const { amount } = req.body;
  console.log('Payment amount received:', amount);

  if (!amount || amount <= 0) {
    console.warn('Invalid payment amount:', amount);
    return res.status(400).json({ error: 'Valid amount required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    console.log('PaymentIntent created:', paymentIntent.id);

    res.json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ error: 'Payment intent creation failed' });
  }
});

app.post('/checkout', authenticateToken, async (req, res) => {
  console.log('POST /checkout → user:', req.user.id);

  try {
    const cart = await Order.findOne({
      where: { userId: req.user.id, status: 'cart' }
    });

    console.log('Cart found:', cart ? cart.id : 'none');

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.status = 'paid';
    await cart.save();

    console.log('Order marked as paid:', cart.id);

    res.json({ message: 'Order completed' });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Order history route
app.get('/orders', authenticateToken, async (req, res) => {
  console.log('GET /orders → user:', req.user.id);

  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id, status: 'paid' }
    });

    console.log('Paid orders found:', orders.length);

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        console.log('Processing order:', order.id);

        const productsWithDetails = [];

        for (const item of order.products) {
          console.log('Order item:', item);

          const product = await Product.findByPk(item.productId);
          if (product) {
            productsWithDetails.push({
              ...product.toJSON(),
              quantity: item.quantity
            });
          } else {
            console.warn('Missing product:', item.productId);
          }
        }

        return {
          id: order.id,
          date: order.createdAt,
          total: order.total,
          products: productsWithDetails
        };
      })
    );

    console.log('Orders response ready');

    res.json(ordersWithDetails);
  } catch (error) {
    console.error('GET /orders error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});


// Export app for testing
module.exports = app;

// Start the server
if (require.main === module) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}