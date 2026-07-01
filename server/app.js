const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db');
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 初始化数据库（异步）
initDatabase().then(() => {
    // 路由
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/products', require('./routes/products'));
    app.use('/api/inbound', require('./routes/inbound'));
    app.use('/api/outbound', require('./routes/outbound'));
    
    // 测试接口
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', message: '仓库管理系统后端运行正常' });
    });
    
    // 启动服务器
    app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('数据库初始化失败:', err);
});