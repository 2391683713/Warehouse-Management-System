// API 基础地址
const API_BASE = 'http://localhost:3000/api';

// 通用请求函数
async function request(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    if (options.body && typeof options.body === 'object') {
        finalOptions.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(API_BASE + url, finalOptions);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('请求失败:', error);
        return { success: false, message: '网络请求失败' };
    }
}

// API 对象
const API = {
    // 登录相关
    auth: {
        login: (username, password) => request('/auth/login', {
            method: 'POST',
            body: { username, password }
        }),
        getUsers: () => request('/auth/users')
    },
    
    // 商品相关
    products: {
        getList: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return request('/products' + (query ? '?' + query : ''));
        },
        getDetail: (id) => request('/products/' + id),
        add: (data) => request('/products', {
            method: 'POST',
            body: data
        }),
        update: (id, data) => request('/products/' + id, {
            method: 'PUT',
            body: data
        }),
        delete: (id) => request('/products/' + id, {
            method: 'DELETE'
        }),
        getCategories: () => request('/products/categories/list')
    },
    
    // 入库相关
    inbound: {
        getList: () => request('/inbound'),
        add: (data) => request('/inbound', {
            method: 'POST',
            body: data
        }),
        getTodayStats: () => request('/inbound/stats/today')
    },
    
    // 出库相关
    outbound: {
        getList: () => request('/outbound'),
        add: (data) => request('/outbound', {
            method: 'POST',
            body: data
        }),
        getTodayStats: () => request('/outbound/stats/today')
    }
};