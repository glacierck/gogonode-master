/**
 * InfraNodus is a lightweight interface to graph databases.
 *
 * This open source, free software is available under MIT license.
 * It is provided as is, with no guarantees and no liabilities.
 * You are very welcome to reuse this code if you keep this notice.
 *
 * Written by Dmitry Paranyushkin | Nodus Labs and hopefully you also...
 * www.noduslabs.com | info AT noduslabs DOT com
 *
 * In some parts the code from the book "Node.js in Action" is used,
 * (c) 2014 Manning Publications Co.
 *
 */

// Get methods to operate on a User object
// Get方法操作用户对象
var User = require('../lib/user');

// Get options for registration invitation code (if exist in config.json file)得到选择注册邀请码(如果存在于配置。json文件)
var options = require('../options');


// The form route function renders the register.ejs template from views and adds 'Register' into the title field there
// 注册的形式路线功能呈现。ejs从视图模板,将“注册”添加到标题字段

exports.form = function(req, res){
    res.render('register', { title: 'gogoNode: Polysingularity Thinking Tool' });
};

// This happens when the user accesses /register with a POST request
// 当用户访问/注册一个POST请求

exports.submit = function(req, res, next){

    // Define data as the parameters entered into the registration form 定义数据作为参数输入到注册表单
    var data = req.body;

    // Call getByName method from User class with the user.name from the form and check if it already exists
    // 从用户调用得到的名字方法类与用户。名字从表单并检查是否已经存在

    User.getByName(data.username, function(err, user){
        if (err) return next(err);

        // The user with this UID already exists?这个UID已经存在的用户吗?
        if (user.uid) {
            res.error("用户名已经存在!");
            res.redirect('back');
        }

        // We have a setting for invite-only registration and it doesn't match?
        // 设置了必须邀请码才能注册且当前输入不匹配
        else if (options.invite.length > 0 && data.invite != options.invite) {
            res.error("请正确填入您的邀请码！");
            res.redirect('back');
        }

        // The user doesn't exist? Then create a new object User with the data from the form
        // 用户不存在?然后创建一个新对象的用户的数据
        else {
            user = new User({
                name: data.username,
                pepper: data.password,
                portal: data.email
            });

            // save that object in Neo4J database
            // Neo 4 J数据库中保存对象
            user.save(function(err){
                if (err) return next(err);

                // save his ID into the session
                req.session.uid = user.uid;

                // redirect to the login page
                // 重定向到登录页面
                res.redirect('/login');
            });
        }
    });
};
