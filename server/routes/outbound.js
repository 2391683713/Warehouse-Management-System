const express = require('express');
const router = express.Router();
const { db } = require('../db');

// 获取出库记录列表
router.get('/', (req, res) => {
    const records = db.prepare(`
        SELECT orr.*, p.name as product_name, p.unit as product_unit
        FROM outbound_records orr
        LEFT JOIN products p ON orr.product_id = p.id
        ORDER BY orr.id DESC
    `).all();
    
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
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) {
        return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    // 检查库存是否充足
    if (product.stock < quantity) {
        return res.status(400).json({ 
            success: false, 
            message: `库存不足，当前库存：${product.stock}` 
        });
    }
    
    // 使用事务：添加出库记录 + 扣减库存
    const addOutbound = db.transaction(() => {
        // 添加出库记录
        const result = db.prepare(`
            INSERT INTO outbound_records (product_id, quantity, operator, remark)
            VALUES (?, ?, ?, ?)
        `).run(product_id, quantity, operator || '管理员', remark || '');
        
        // 扣减库存
        db.prepare(`
            UPDATE products 
            SET stock = stock - ? 
            WHERE id = ?
        `).run(quantity, product_id);
        
        return result.lastInsertRowid;
    });
    
    const recordId = addOutbound();
    
    // 返回完整的出库记录
    const newRecord = db.prepare(`
        SELECT orr.*, p.name as product_name
        FROM outbound_records orr
        LEFT JOIN products p ON orr.product_id = p.id
        WHERE orr.id = ?
    `).get(recordId);
    
    res.json({
        success: true,
        message: '出库成功',
        data: newRecord
    });
});

// 获取今日出库统计
router.get('/stats/today', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = db.prepare(`
        SELECT 
            COUNT(*) as count,
            COALESCE(SUM(quantity), 0) as total_quantity
        FROM outbound_records
        WHERE DATE(create_time) = ?
    `).get(today);
    
    res.json({
        success: true,
        data: stats
    });
});

module.exports = router;