import api from './axiosConfig';

export const fetchInventory = {
  //GET
  getInventory: async (skuCode) => {
    const response = await api.get(`/inventory/sku/${skuCode}`);
    return response.data;
  },
  restock: async (skuCode, quantity) => {
    await api.post('/inventory/restock', { skuCode, quantity });
  },
  createInventory: async (skuCode, quantity) => {
    const response = await api.post('/inventory/create', { skuCode, quantity });
    return response.data;
  },
};
