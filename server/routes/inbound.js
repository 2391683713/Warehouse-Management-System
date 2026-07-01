const express = require('express');
const router = express.Router();
const { query, run, transaction } = require('../db');

// 获取入库记录列表
router.get('/', (req, res) => {
    const records = query(`
        SELECT ir.*, p.name as product_name, p.unit as product_unit
        FROM inbound_records ir
        LEFT JOIN products p ON ir.product_id = p.id
        ORDER BY ir.id DESC
    `);
    
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
    const products = query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (products.length === 0) {
        return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    try {
        let recordId;
        
        transaction(() => {
            // 添加入库记录
            const result = run(`
                INSERT INTO inbound_records (product_id, quantity, operator, remark)
                VALUES (?, ?, ?, ?)
            `, [product_id, quantity, operator || '管理员', remark || '']);
            
            recordId = result.lastInsertRowid;
            
            // 更新库存
            run(`
                UPDATE products 
                SET stock = stock + ? 
                WHERE id = ?
            `, [quantity, product_id]);
        });
        
        // 返回完整的入库记录
        const newRecord = query(`
            SELECT ir.*, p.name as product_name
            FROM inbound_records ir
            LEFT JOIN products p ON ir.product_id = p.id
            WHERE ir.id = ?
        `, [recordId]);
        
        res.json({
            success: true,
            message: '入库成功',
            data: newRecord[0]
        });
    } catch (error) {
        console.error('入库失败:', error);
        res.status(500).json({
            success: false,
            message: '入库失败'
        });
    }
});

// 获取今日入库统计
router.get('/stats/today', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = query(`
        SELECT 
            COUNT(*) as count,
            COALESCE(SUM(quantity), 0) as total_quantity
        FROM inbound_records
        WHERE DATE(create_time) = ?
    `, [today]);
    
    res.json({
        success: true,
        data: stats[0] || { count: 0, total_quantity: 0 }
    });
});

module.exports = router;