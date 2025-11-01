import axios from 'axios';
import type { Experience, ExperienceWithSlots, CreateBookingRequest, Booking, PromoValidation } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const experiencesAPI = {
  getAll: async (params?: {
    limit?: number;
    offset?: number;
    category?: string;
    min_price?: number;
    max_price?: number;
  }) => {
    const response = await api.get<{ success: boolean; data: Experience[] }>('/experiences', { params });
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: ExperienceWithSlots }>(`/experiences/${id}`);
    return response.data.data;
  },

  getCategories: async () => {
    const response = await api.get<{ success: boolean; data: string[] }>('/experiences/categories');
    return response.data.data;
  },

  search: async (query: string) => {
    const response = await api.get<{ success: boolean; data: Experience[] }>('/experiences/search', {
      params: { q: query },
    });
    return response.data.data;
  },
};

export const bookingsAPI = {
  create: async (booking: CreateBookingRequest) => {
    const response = await api.post<{ success: boolean; data: Booking }>('/bookings', booking);
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Booking }>(`/bookings/${id}`);
    return response.data.data;
  },

  getByEmail: async (email: string) => {
    const response = await api.get<{ success: boolean; data: Booking[] }>(`/bookings/user/${email}`);
    return response.data.data;
  },
};

export const promoAPI = {
  validate: async (code: string, amount: number) => {
    const response = await api.post<{ success: boolean; data: PromoValidation }>('/promo/validate', {
      code,
      amount,
    });
    return response.data.data;
  },

  getActive: async () => {
    const response = await api.get<{ success: boolean; data: any[] }>('/promo/active');
    return response.data.data;
  },
};

export default api;
