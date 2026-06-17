import api from './axiosConfig';

let productsCache = null;
let productsRequest = null;

export const fetchProducts = {

    //GET
    getAllProducts: async ({ force = false } = {}) => {
        if (!force && productsCache) {
            return productsCache;
        }

        if (!force && productsRequest) {
            return productsRequest;
        }

        productsRequest = api.get("/product")
            .then((response) => {
                productsCache = response.data;
                return productsCache;
            })
            .finally(() => {
                productsRequest = null;
            });

        return productsRequest;
    },
    getProductById: async (id) => {
        const products = await fetchProducts.getAllProducts();
        return products.find(product => product.id === id || product.id?.toString() === id?.toString());
    },
    getProductBySkuCode: async (skuCode) => {
        const response = await api.get(`/product/sku/${skuCode}`);
        return response.data;
    },
    clearCache: () => {
        productsCache = null;
        productsRequest = null;
    },
    //POST
    createProduct: async (productData) => {
        const response = await api.post('/product', productData);
        fetchProducts.clearCache();
        return response.data;
    },
    //PUT
    updateProduct: async (id, productData) => {
        const response = await api.put(`/product/${id}`, productData);
        fetchProducts.clearCache();
        return response.data;
    },
    //DELETE
    deleteProduct: async (id) => {
        const response = await api.delete(`/product/${id}`);
        fetchProducts.clearCache();
        return response.data;
    }
}
