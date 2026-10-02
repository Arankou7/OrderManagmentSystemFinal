import api from './axiosConfig';

export const categoryApi = {
  getAll: async () => (await api.get('/categories')).data,
  create: async (payload) => (await api.post('/categories', payload)).data,
  update: async (id, payload) => (await api.put(`/categories/${id}`, payload)).data,
  delete: async (id) => api.delete(`/categories/${id}`),
};
