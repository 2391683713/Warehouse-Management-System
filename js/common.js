// ==================== localStorage 工具函数 ====================

// 保存数据到 localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// 从 localStorage 读取数据
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// 删除数据
function removeData(key) {
    localStorage.removeItem(key);
}

// ==================== 商品数据操作 ====================

// 获取所有商品
function getProducts() {
    return getData('products') || [];
}

// 保存商品
function saveProducts(products) {
    saveData('products', products);
}

// 添加商品
function addProduct(product) {
    const products = getProducts();
    product.id = Date.now(); // 用时间戳当ID
    products.push(product);
    saveProducts(products);
}

// 更新商品
function updateProduct(id, updatedProduct) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedProduct };
        saveProducts(products);
    }
}

// 删除商品
function deleteProduct(id) {
    const products = getProducts();
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
}

// ==================== 入库记录操作 ====================

// 获取所有入库记录
function getInboundRecords() {
    return getData('inboundRecords') || [];
}

// 添加入库记录
function addInboundRecord(record) {
    const records = getInboundRecords();
    record.id = Date.now();
    record.time = new Date().toLocaleString();
    records.unshift(record);
    saveData('inboundRecords', records);
    
    // 更新库存
    const product = getProducts().find(p => p.id === record.productId);
    if (product) {
        product.stock = parseInt(product.stock) + parseInt(record.quantity);
        updateProduct(product.id, { stock: product.stock });
    }
}

// ==================== 出库记录操作 ====================

// 获取所有出库记录
function getOutboundRecords() {
    return getData('outboundRecords') || [];
}

// 添加出库记录
function addOutboundRecord(record) {
    const records = getOutboundRecords();
    record.id = Date.now();
    record.time = new Date().toLocaleString();
    records.unshift(record);
    saveData('outboundRecords', records);
    
    // 更新库存
    const product = getProducts().find(p => p.id === record.productId);
    if (product) {
        product.stock = parseInt(product.stock) - parseInt(record.quantity);
        updateProduct(product.id, { stock: product.stock });
    }
}

// ==================== 登录相关 ====================

// 检查是否已登录
function checkLogin() {
    const user = getData('currentUser');
    if (!user) {
        window.location.href = 'login.html';
    }
}

// 退出登录
function logout() {
    removeData('currentUser');
    window.location.href = 'login.html';
}

// ==================== 侧边栏高亮 ====================

function setActiveMenu(menuId) {
    const menuItems = document.querySelectorAll('.sidebar li');
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.id === menuId) {
            item.classList.add('active');
        }
    });
}

// ==================== 工具函数 ====================

// 格式化日期
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleString();
}

// 生成随机ID
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}