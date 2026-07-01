const express = require('express');
const router = express.Router();
const { query, run } = require('../db');

// 获取商品列表
router.get('/', (req, res) => {
    const { keyword, category } = req.query;
    
    let sql = 'SELECT * FROM products WHERE 1=1';
    let params = [];
    
    if (keyword) {
        sql += ' AND name LIKE ?';
        params.push(`%${keyword}%`);
    }
    
    if (category) {
        sql += ' AND category = ?';
        params.push(category);
    }
    
    sql += ' ORDER BY id DESC';
    
    const products = query(sql, params);
    
    res.json({
        success: true,
        data: products
    });
});

// 获取单个商品
router.get('/:id', (req, res) => {
    const products = query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (products.length > 0) {
        res.json({ success: true, data: products[0] });
    } else {
        res.status(404).json({ success: false, message: '商品不存在' });
    }
});

// 新增商品
router.post('/', (req, res) => {
    const { name, category, unit, stock, price, supplier } = req.body;
    
    if (!name) {
        return res.status(400).json({ 
            success: false, 
            message: '商品名称不能为空' 
        });
    }
    
    const result = run(`
        INSERT INTO products (name, category, unit, stock, price, supplier)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
        name,
        category || '其他',
        unit || '个',
        stock || 0,
        price || 0,
        supplier || ''
    ]);
    
    const newProduct = query('SELECT * FROM products WHERE id = ?', [result.lastInsertRowid]);
    
    res.json({
        success: true,
        message: '新增成功',
        data: newProduct[0]
    });
});

// 更新商品
router.put('/:id', (req, res) => {
    const { name, category, unit, stock, price, supplier } = req.body;
    
    const products = query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (products.length === 0) {
        return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    const product = products[0];
    
    run(`
        UPDATE products 
        SET name = ?, category = ?, unit = ?, stock = ?, price = ?, supplier = ?
        WHERE id = ?
    `, [
        name || product.name,
        category !== undefined ? category : product.category,
        unit || product.unit,
        stock !== undefined ? stock : product.stock,
        price !== undefined ? price : product.price,
        supplier !== undefined ? supplier : product.supplier,
        req.params.id
    ]);
    
    const updatedProduct = query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    res.json({
        success: true,
        message: '更新成功',
        data: updatedProduct[0]
    });
});

// 删除商品
router.delete('/:id', (req, res) => {
    const products = query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (products.length === 0) {
        return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    run('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    res.json({
        success: true,
        message: '删除成功'
    });
});

// 获取分类列表
router.get('/categories/list', (req, res) => {
    const result = query(`
        SELECT DISTINCT category 
        FROM products 
        WHERE category IS NOT NULL AND category != ''
        ORDER BY category
    `);
    
    const categories = result.map(item => item.category);
    
    res.json({
        success: true,
        data: categories
    });
});

module.exports = router;