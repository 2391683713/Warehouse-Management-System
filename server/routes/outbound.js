const express = require('express');
const router = express.Router();
const { query, run, transaction } = require('../db');

// 获取出库记录列表
router.get('/', (req, res) => {
    const records = query(`
        SELECT orr.*, p.name as product_name, p.unit as product_unit
        FROM outbound_records orr
        LEFT JOIN products p ON orr.product_id = p.id
        ORDER BY orr.id DESC
    `);
    
    res.json({
        success: true,
        data: records
    });
});

// 新增出库记录
router.post('/', (req, res) => {
    const { product_id, quantity, operator, remark } = req.body;
    
    if (!product_id || !quantity) {
        return res.status(400).json({ 
            success: false, 
            message: '商品和数量不能为空' 
        });
    }
    
    if (quantity <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: '出库数量必须大于0' 
        });
    }
    
    // 检查商品是否存在
    const products = query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (products.length === 0) {
        return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    const product = products[0];
    
    // 检查库存是否充足
    if (product.stock < quantity) {
        return res.status(400).json({ 
            success: false, 
            message: `库存不足，当前库存：${product.stock}` 
        });
    }
    
    try {
    // 添加出库记录
    const result = run(`
        INSERT INTO outbound_records (product_id, quantity, operator, remark)
        VALUES (?, ?, ?, ?)
    `, [product_id, quantity, operator || '管理员', remark || '']);
    
    const recordId = result.lastInsertRowid;
    
    // 扣减库存
    run(`
        UPDATE products 
        SET stock = stock - ? 
        WHERE id = ?
    `, [quantity, product_id]);
    
    // 返回完整的出库记录
    const newRecord = query(`
        SELECT orr.*, p.name as product_name
        FROM outbound_records orr
        LEFT JOIN products p ON orr.product_id = p.id
        WHERE orr.id = ?
    `, [recordId]);
    
    res.json({
        success: true,
        message: '出库成功',
        data: newRecord[0]
    });
} catch (error) {
    console.error('出库失败:', error);
    res.status(500).json({
        success: false,
        message: '出库失败'
    });
}
});

// 获取今日出库统计
router.get('/stats/today', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = query(`
        SELECT 
            COUNT(*) as count,
            COALESCE(SUM(quantity), 0) as total_quantity
        FROM outbound_records
        WHERE DATE(create_time) = ?
    `, [today]);
    
    res.json({
        success: true,
        data: stats[0] || { count: 0, total_quantity: 0 }
    });
});

module.exports = router;