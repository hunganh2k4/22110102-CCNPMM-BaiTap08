import axios from './axios.customize';

const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    const data = { name, email, password };
    return axios.post(URL_API, data);
};

const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    const data = { email, password };
    return axios.post(URL_API, data);
};

const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API);
};

const forgotPasswordApi = (email, newPassword) => {
    const URL_API = "/v1/api/forgot-password";
    const data = { email, newPassword };
    return axios.post(URL_API, data);
};

const getProductsApi = (params) => {
    const URL_API = "/v1/api/products";
    return axios.get(URL_API, { params });
};

const searchProductsApi = (params) => {
    const URL_API = "/v1/api/products/search";
    return axios.get(URL_API, { params });
};

// --- new API helpers ---
const toggleFavoriteApi = (productId) => {
    return axios.post(`/v1/api/products/${productId}/favorite`);
}

const getUserFavoritesApi = (userId = null) => {
    // If userId provided, pass as query param; otherwise backend extracts from token
    if (userId) {
        return axios.get(`/v1/api/products/favorites`, { params: { userId } });
    }
    return axios.get(`/v1/api/products/favorites`);
}

// thêm helpers cho product detail & comments
const getProductDetailApi = (productId) => {
    return axios.get(`/v1/api/products/${productId}`);
};

const getCommentsApi = (productId) => {
    return axios.get(`/v1/api/products/${productId}/comments`);
};

const postCommentApi = (productId, content) => {
    return axios.post(`/v1/api/products/${productId}/comment`, { content });
};

const getCountsApi = (productId) => {
    return axios.get(`/v1/api/products/${productId}/counts`);
};

const getSimilarApi = (productId) => {
    return axios.get(`/v1/api/products/${productId}/similar`);
};

const getProductsByCategoryApi = (category, limit = 5) => {
    const URL_API = "/v1/api/products";
    return axios.get(URL_API, { 
        params: { 
            category, 
            limit 
        } 
    });
};

export {
    createUserApi, loginApi, getUserApi, forgotPasswordApi,
    getProductsApi, searchProductsApi,
    toggleFavoriteApi, getUserFavoritesApi,
    getProductDetailApi, getCommentsApi, postCommentApi, getCountsApi, getSimilarApi,
    getProductsByCategoryApi
};
