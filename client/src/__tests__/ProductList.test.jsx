import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import ProductList from '../pages/ProductList';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('ProductList Component', () => {
  beforeEach(() => {
    mockedAxios.get = jest.fn();
    mockedAxios.post = jest.fn();
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
  });

  test('displays loading initially', () => {
    render(<ProductList />);
    expect(screen.getByText('Our Products')).toBeInTheDocument();
    // Check for skeleton cards
    expect(document.querySelector('.skeleton')).toBeInTheDocument();
  });

  test('fetches and displays products', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', description: 'Desc 1', price: 10.99, imageUrl: 'img1.jpg' },
      { id: 2, name: 'Product 2', description: 'Desc 2', price: 20.99, imageUrl: 'img2.jpg' },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Our Products')).toBeInTheDocument();
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('10.99')).toBeInTheDocument();
      expect(screen.getByText('20.99')).toBeInTheDocument();
    });

    expect(mockedAxios.get).toHaveBeenCalledWith('/products');
  });

  test('adds product to cart', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', description: 'Desc 1', price: 10.99, imageUrl: 'img1.jpg' },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });
    mockedAxios.post.mockResolvedValueOnce({});

    // Mock alert
    global.alert = jest.fn();

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const addToCartButton = screen.getByRole('button', { name: 'Add to Cart' });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/cart', { productId: 1, quantity: 1 });
      expect(screen.getByText('Added!')).toBeInTheDocument();
    });
  });

  test('handles add to cart error', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', description: 'Desc 1', price: 10.99, imageUrl: 'img1.jpg' },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

    global.alert = jest.fn();

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const addToCartButton = screen.getByRole('button', { name: 'Add to Cart' });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to add to cart');
    });
  });
});