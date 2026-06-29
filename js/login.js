// 预设的用户账号
const users = [
    { username: 'admin', password: '123456', role: '管理员' },
    { username: 'zuoyang', password: '123456', role: '仓库管理员' },
    { username: 'yuanlonghao', password: '123456', role: '仓库管理员' },
    { username: 'liutianshuang', password: '123456', role: '仓库管理员' },
    { username: 'weizhiwen', password: '123456', role: '仓库管理员' }
];

// 登录表单提交
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMsg');
    
    // 简单验证
    if (!username) {
        showError('请输入用户名');
        return;
    }
    if (!password) {
        showError('请输入密码');
        return;
    }
    
    // 验证用户名密码
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // 登录成功，保存用户信息
        saveData('currentUser', {
            username: user.username,
            role: user.role,
            loginTime: new Date().toLocaleString()
        });
        
        // 跳转到首页
        window.location.href = 'index.html';
    } else {
        showError('用户名或密码错误');
    }
});

// 显示错误信息
function showError(msg) {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 3000);
}   
