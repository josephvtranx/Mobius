import api from './api';

// Payment Service for handling payment-related API calls
export const paymentService = {
  // Get payment overview data
  getPaymentOverview: async (period = 'month') => {
    try {
      const response = await api.get(`/payments/overview?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment overview:', error);
      throw error;
    }
  },

  // Get invoices with filters
  getInvoices: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/payments/invoices?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  // Get payments with filters
  getPayments: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/payments/transactions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  // Get student credits
  getStudentCredits: async (studentId = null) => {
    try {
      const url = studentId ? `/payments/credits/${studentId}` : '/payments/credits';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching student credits:', error);
      throw error;
    }
  },

  // Get credit packages
  getCreditPackages: async () => {
    try {
      const response = await api.get('/payments/packages');
      return response.data;
    } catch (error) {
      console.error('Error fetching credit packages:', error);
      throw error;
    }
  },

  // Add credits to student
  addCredits: async (creditsData) => {
    try {
      const response = await api.post('/payments/credits/add', creditsData);
      return response.data;
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  },

  // Create credit package
  createCreditPackage: async (packageData) => {
    try {
      const response = await api.post('/payments/packages', packageData);
      return response.data;
    } catch (error) {
      console.error('Error creating credit package:', error);
      throw error;
    }
  },

  // Update credit package
  updateCreditPackage: async (id, packageData) => {
    try {
      const response = await api.put(`/payments/packages/${id}`, packageData);
      return response.data;
    } catch (error) {
      console.error('Error updating credit package:', error);
      throw error;
    }
  },

  // Delete credit package
  deleteCreditPackage: async (id) => {
    try {
      const response = await api.delete(`/payments/packages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting credit package:', error);
      throw error;
    }
  },

  // Issue invoice
  issueInvoice: async (invoiceData) => {
    try {
      const response = await api.post('/payments/invoices', invoiceData);
      return response.data;
    } catch (error) {
      console.error('Error issuing invoice:', error);
      throw error;
    }
  },

  // Record payment
  recordPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/transactions', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },

  // Process refund
  processRefund: async (transactionId, refundData) => {
    try {
      const response = await api.post(`/payments/transactions/${transactionId}/refund`, refundData);
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  },

  // Get payment statistics
  getPaymentStats: async (period = 'month') => {
    try {
      const response = await api.get(`/payments/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
      throw error;
    }
  }
};

export default paymentService; 