import axios from 'axios';
import { Product } from '../types';

const API_BASE_URL = 'http://localhost:5000/api/comparison';

export const comparisonService = {
  /**
   * Run inter-site comparison using the Node.js script via backend
   */
  async getInterComparison(productId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/inter/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inter-site comparison:', error);
      throw error;
    }
  },

  /**
   * Run intra-site comparison using the Python script via backend
   */
  async getIntraComparison(wishlistIds: string[], query: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/intra`, {
        wishlistIds,
        query
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching intra-site comparison:', error);
      throw error;
    }
  }
};
