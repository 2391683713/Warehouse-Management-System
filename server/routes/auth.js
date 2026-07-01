const express = require('express');
const router = express.Router();
const { db } = require('../db');

// 登录
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: '用户名和密码不能为空' 
        });
    }

    const user = db.prepare(`
        SELECT id, username, role, create_time 
        FROM users 
        WHERE username = ? AND password = ?
    `).get(username, password);

    if (user) {
        res.json({
            success: true,
            message: '登录成功',
            data: user
        });
    } else {
        res.status(401).json({
            success: false,
            message: '用户名或密码错误'
        });
    }
});

// 获取用户列表
router.get('/users', (req, res) => {
    const users = db.prepare(`
        SELECT id, username, role, create_time 
        FROM users 
        ORDER BY id
    `).all();
    
    res.json({
        success: true,
        data: users
    });
});

module.exports = router;