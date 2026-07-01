const express = require('express');
const router = express.Router();
const { db } = require('../db');

// 获取入库记录列表
router.get('/', (req, res) => {
    const records = db.prepare(`
        SELECT ir.*, p.name as product_name, p.unit as product_unit
        FROM inbound_records ir
        LEFT JOIN products p ON ir.product_id = p.id
        ORDER BY ir.id DESC
    `).all();
    
    res.json({
        success: true,
        data: records
    });
});

// 新加入库记录
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
            message: '入库数量必须大于0' 
        });
    }
    
    // 检查商品是否存在
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) {
        return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    // 使用事务：添加入库记录 + 更新库存
    const addInbound = db.transaction(() => {
        // 添加入库记录
        const result = db.prepare(`
            INSERT INTO inbound_records (product_id, quantity, operator, remark)
            VALUES (?, ?, ?, ?)
        `).run(product_id, quantity, operator || '管理员', remark || '');
        
        // 更新库存
        db.prepare(`
            UPDATE products 
            SET stock = stock + ? 
            WHERE id = ?
        `).run(quantity, product_id);
        
        return result.lastInsertRowid;
    });
    
    const recordId = addInbound();
    
    // 返回完整的入库记录
    const newRecord = db.prepare(`
        SELECT ir.*, p.name as product_name
        FROM inbound_records ir
        LEFT JOIN products p ON ir.product_id = p.id
        WHERE ir.id = ?
    `).get(recordId);
    
    res.json({
        success: true,
        message: '入库成功',
        data: newRecord
    });
});

// 获取今日入库统计
router.get('/stats/today', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = db.prepare(`
        SELECT 
            COUNT(*) as count,
            COALESCE(SUM(quantity), 0) as total_quantity
        FROM inbound_records
        WHERE DATE(create_time) = ?
    `).get(today);
    
    res.json({
        success: true,
        data: stats
    });
});

module.exports = router;