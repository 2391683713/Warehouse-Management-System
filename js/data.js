// ==================== 初始化数据 ====================

// 检查是否已经初始化过
function initData() {
    const products = getProducts();
    
    // 如果还没有数据，就初始化一些示例数据
    if (products.length === 0) {
        const sampleProducts = [
            {
                id: 1001,
                name: '联想笔记本电脑',
                category: '电子产品',
                unit: '台',
                stock: 50,
                price: 5999,
                supplier: '联想集团',
                createTime: '2024-01-15 10:30:00'
            },
            {
                id: 1002,
                name: '无线鼠标',
                category: '电子产品',
                unit: '个',
                stock: 200,
                price: 89,
                supplier: '罗技科技',
                createTime: '2024-01-16 14:20:00'
            },
            {
                id: 1003,
                name: 'A4打印纸',
                category: '办公用品',
                unit: '包',
                stock: 500,
                price: 25,
                supplier: '得力文具',
                createTime: '2024-01-17 09:15:00'
            },
            {
                id: 1004,
                name: '签字笔',
                category: '办公用品',
                unit: '支',
                stock: 1000,
                price: 3,
                supplier: '晨光文具',
                createTime: '2024-01-18 16:45:00'
            },
            {
                id: 1005,
                name: '办公椅',
                category: '办公家具',
                unit: '把',
                stock: 30,
                price: 399,
                supplier: '西昊家具',
                createTime: '2024-01-19 11:00:00'
            }
        ];
        
        saveProducts(sampleProducts);
        
        // 初始化一些入库记录
        const sampleInbound = [
            {
                id: 2001,
                productId: 1001,
                quantity: 20,
                operator: '管理员',
                time: '2024-01-20 10:00:00',
                remark: '首批入库'
            },
            {
                id: 2002,
                productId: 1002,
                quantity: 100,
                operator: '管理员',
                time: '2024-01-21 14:30:00',
                remark: '补货'
            }
        ];
        
        saveData('inboundRecords', sampleInbound);
        
        // 初始化一些出库记录
        const sampleOutbound = [
            {
                id: 3001,
                productId: 1003,
                quantity: 50,
                operator: '管理员',
                time: '2024-01-22 09:00:00',
                remark: '行政部领用'
            }
        ];
        
        saveData('outboundRecords', sampleOutbound);
        
        console.log('数据初始化完成');
    }
}

// 页面加载时自动初始化
window.addEventListener('load', function() {
    // 只在非登录页面初始化
    if (!window.location.pathname.includes('login')) {
        initData();
    }
});