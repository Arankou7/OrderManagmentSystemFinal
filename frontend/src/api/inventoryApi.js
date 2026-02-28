import api from "./axiosConfig";

export const fetchInventory = {

    //GET
    getInventory:async (skuCode) => {
        const response = await api.get(`/inventory/sku/${skuCode}`);
        return response.data;
    }
}