const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

// 数据库文件路径
const dbPath = path.join(__dirname, 'warehouse.db');

let db;

// 初始化数据库
async function initDatabase() {
    const SQL = await initSqlJs();
    
    // 如果数据库文件存在，就加载；否则新建
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
        console.log('数据库加载成功');
    } else {
        db = new SQL.Database();
        console.log('新建数据库');
        
        // 创建表
        db.run(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT '仓库管理员',
                create_time DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        db.run(`
            CREATE TABLE products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT,
                unit TEXT DEFAULT '个',
                stock INTEGER DEFAULT 0,
                price REAL DEFAULT 0,
                supplier TEXT,
                create_time DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        db.run(`
            CREATE TABLE inbound_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                operator TEXT,
                remark TEXT,
                create_time DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        db.run(`
            CREATE TABLE outbound_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                operator TEXT,
                remark TEXT,
                create_time DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 插入默认用户
        const users = [
            ['admin', '123456', '管理员'],
            ['zuoyang', '123456', '仓库管理员'],
            ['yuanlonghao', '123456', '仓库管理员'],
            ['liutianshuang', '123456', '仓库管理员'],
            ['weizhiwen', '123456', '仓库管理员']
        ];
        
        const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
        users.forEach(user => stmt.run(user));
        stmt.free();
        
        // 插入示例商品
        const products = [
            ['联想笔记本电脑', '电子产品', '台', 50, 5999, '联想集团'],
            ['无线鼠标', '电子产品', '个', 200, 89, '罗技科技'],
            ['A4打印纸', '办公用品', '包', 500, 25, '得力文具'],
            ['签字笔', '办公用品', '支', 1000, 3, '晨光文具'],
            ['办公椅', '办公家具', '把', 30, 399, '西昊家具']
        ];
        
        const stmt2 = db.prepare('INSERT INTO products (name, category, unit, stock, price, supplier) VALUES (?, ?, ?, ?, ?, ?)');
        products.forEach(p => stmt2.run(p));
        stmt2.free();
        
        // 保存到文件
        saveDatabase();
        console.log('数据库初始化完成');
    }
}

// 保存数据库到文件
function saveDatabase() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
}

// 查询（返回数组）
function query(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const result = [];
    
    while (stmt.step()) {
        result.push(stmt.getAsObject());
    }
    
    stmt.free();
    return result;
}

// 执行（增删改）
function run(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.run(params);
    stmt.free();
    saveDatabase(); // 每次修改后保存
    
    // 返回 lastInsertRowid 和 changes
    return {
        lastInsertRowid: db.exec('SELECT last_insert_rowid() as id')[0].values[0][0],
        changes: db.getRowsModified()
    };
}

// 执行事务
function transaction(callback) {
    try {
        const result = callback();
        saveDatabase();
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    initDatabase,
    query,
    run,
    transaction
};