const express = require('express');
const router = express.Router();
const { query } = require('../db');

// 登录
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: '用户名和密码不能为空' 
        });
    }

    const users = query(`
        SELECT id, username, role, create_time 
        FROM users 
        WHERE username = ? AND password = ?
    `, [username, password]);

    if (users.length > 0) {
        res.json({
            success: true,
            message: '登录成功',
            data: users[0]
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
    const users = query(`
        SELECT id, username, role, create_time 
        FROM users 
        ORDER BY id
    `);
    
    res.json({
        success: true,
        data: users
    });
});

module.exports = router;