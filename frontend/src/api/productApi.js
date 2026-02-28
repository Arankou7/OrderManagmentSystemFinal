import api from './axiosConfig';

export const fetchProducts = {

    //GET
    getAllProducts: async () => {
        const response = await api.get("/product");
        return response.data;
    },
    getProductBySkuCode: async (skuCode) => {
        const response = await api.get(`/product/${skuCode}`);
        return response.data;
    },
    //POST
    createProduct: async (productData) => {
    const response = await api.post('/product', productData);
    return response.data;
    },
    //PUT
    updateProduct: async (id, productData) => {
    const response = await api.put(`/product/${id}`, productData);
    return response.data;
    },
    //DELETE
    deleteProduct: async (id) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
    }
}