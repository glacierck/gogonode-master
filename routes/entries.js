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

var Entry = require('../lib/entry');
var FlowdockText = require("flowdock-text");
var validate = require('../lib/middleware/validate');
var options = require('../options');
var async = require('async');


exports.list = function(req, res, next){

    // The one who sees the statements (hello Tengo @1Q84 #Murakami)
    // 接受者
    var receiver = '';

    // The one who made the statements (hello Fuka-Eri @1Q84 #Murakami)
    // 创建者
    var perceiver = '';

    var receivername = null;

    var perceivername = null;

    var contextpublic = null;

    // We checked the context using validate.getContextPrivacy() function and got the variable for it
    // 检测上下文
    if (res.locals.contextpublic) {
        contextpublic = res.locals.contextpublic;
    }

    // If the user is logged in then we know the ID and the name of the user who is viewing
    // 如果用户已经登录了然后我们知道ID和用户的名称查看
    if (res.locals.user) {
        if (!res.locals.user.publicview) {
            receiver = res.locals.user.uid;
        }
        receivername = res.locals.user.name;

    }

    // Is there user name in the requested URL AND we know their ID already? Then the entries of that user will be shown
    // 在请求的URL的用户名,我们已经知道他们的ID吗?是则该用户的条目将被显示
    if (req.params.user && res.locals.viewuser) {
        perceiver = res.locals.viewuser;
        perceivername = req.params.user;
    }


    console.log('wtf');
    console.log(receiver);
    console.log(perceiver);
    // Let's see what context the user wants to view if there is one
    // 输出用户请求的上下文信息

    var contexts = [];
        contexts.push(req.params.context);

    // Do we want to compare it with another ?addcontext=... ? 是否需要比较

    if (req.query.addcontext) contexts.push(req.query.addcontext);

    // Now let's arrange what users we want to see and what information
    // 现在让我们安排用户我们希望看到什么信息

    Entry.getRange(receiver, perceiver, contexts, function(err, entries) {
        if (err) return next(err);

        // Add links to @contexts and #hashtags 挂钩链接到上下文和便签上
        for (var i = 0; i < entries.length; ++ i) {
              //entries[i].text = FlowdockText.autoLinkMentions(entries[i].text,{hashtagUrlBase:"/contexts/",hashtagClass:"app-context-link"});
              //entries[i].text = FlowdockText.autoLinkHashtags(entries[i].text,{hashtagUrlBase:"/concepts/",hashtagClass:"app-concept-link"});
            entries[i].text = validate.safe_tags(entries[i].text);
            entries[i].text = FlowdockText.autoLinkUrlsCustom(entries[i].text,{class:"app-url-link",target:"_blank"});

        }

        console.log("Showing statements to user " + receiver);
        console.log("Statements made by " + perceiver);

        for (var s=0;s<contexts.length;++s) {
            if (contexts[s] == 'undefined' || typeof contexts[s] === 'undefined') {
                contexts[s] = '';
            }
        }

        res.render('entries', {
            title: 'gogoNode: Polysingularity Thinking Tool',
            entries: entries,
            context: contexts[0],
            addcontext: req.query.addcontext,
            perceivername: perceivername,
            receivername: receivername,
            contextpublic: contextpublic,
            showcontexts: req.query.showcontexts,
            background: req.query.background,
            maxnodes: req.query.maxnodes,
            url: req.query.url,
            urltitle: req.query.urltitle
        });
    });
};

exports.form = function(req, res){
    res.render('post', { title: 'Post' });
};

exports.submit = function(req, res, next){

    // Retrieve the statement 检索语句
    var statement = req.body.entry.body;

    // Retrieve the context where user was in when submitting the statement 检索用户的上下文时提交的声明
    var default_context = req.body.context;

    // Pass on the context IDs from the DB
    var contextids = req.contextids;

    // Some parameter settings 一些参数设置
    var max_length = options.settings.max_text_length;
    var min_length = options.settings.min_text_length;
    var maxhash = options.settings.max_hashtags;

    // Generate new timestamp and multiply it by 10000 to be able to track the sequence the nodes were created in
    // 生成新的时间戳和乘以10000能够跟踪序列节点中创建
    var timestamp = new Date().getTime() * 10000;

    if (req.body.timestamp) {
        timestamp = req.body.timestamp;
    }

    // A series of checks before the statement is submitted 一系列的检查提交声明前
    async.waterfall([
        function(callback){
            if (!statement) {
                callback('请输入一个 statement');
            }
            else if (statement.length <= min_length) {
                callback('statement 必须超过 ' + min_length + ' 个字节');
            }
            else if (statement.length > max_length) {
                callback('尽量不要超过 ' + max_length + ' 个字节 。。。');
            }
            else {
                callback(null, statement);
            }
        },
        function(statement, callback){
            statement = validate.sanitize(statement);
            callback(null, statement);
        },
        function(statement, callback){

            var hashtags = validate.getHashtags(statement, res);

            if (req.onlymentions) {
                hashtags = '';
            }

            var mentions = validate.getMentions(statement);

            if (req.excludementions) {
                mentions = '';
            }


            if  (!hashtags && mentions.length < 1) {
                callback('必须包含一个以下其中的一种标注 #hashtag 或者 @mention.');
            }
            else {
                if (hashtags) {
                    if (hashtags.length >= maxhash) {
                        callback('请不要添加超过 ' + maxhash + ' 个的 #hashtags');
                    }
                    else {
                        callback(null, statement, hashtags, mentions);
                    }
                }
                else {
                    callback(null, statement, hashtags, mentions);
                }
            }
        },
        function(statement, hashtags, mentions, callback){

            // Put all the contexts that came with the statement into a new variable

            var contexts = [];

            if (contextids.length > 0) {
                for (var i = 0; i < contextids.length; i++) {
                        contexts.push(contextids[i]);
                }
                callback(null, statement, hashtags, contexts, mentions);
            }
            else {
                callback('Please, select a context for this statement');
            }


        },
        function(statement, hashtags, contexts, mentions, callback){
            // Then we ascribe the data that the Entry object needs in order to survive
            // We create various fields and values for that object and initialize it

            var entry = new Entry({
                "by_uid": res.locals.user.uid,
                "by_id": res.locals.user.uid,
                "by_name": res.locals.user.name,
                "contexts": contexts,
                "hashtags": hashtags,
                "mentions": mentions,
                "text": statement,
                "fullscan": res.locals.user.fullscan,
                "timestamp": timestamp

            });
            callback(null, entry);
        }
    ], function (err, entry) {

        if (err) {

            console.log(err);

            if (!req.internal) {
                res.send({errormsg: err});
               // res.redirect('back');
            }

        }
        else {
            entry.save(function(err, answer) {
                if (err) {
                    if (req.internal) {

                    }
                    else {
                        return next(err);
                    }
                }
                if (req.remoteUser) {
                    res.json({message: 'Entry added.'});
                }
                else if (req.internal) {
                    //next();
                }
                else {
                    if (req.body.delete == 'delete' || req.body.btnSubmit == 'edit' || req.body.delete == 'delete context') {
                        if (default_context == 'undefined' || typeof default_context === 'undefined' || default_context == '') {
                         res.redirect('/' + res.locals.user.name + '/edit');
                         }
                         else {
                         res.redirect(res.locals.user.name + '/' + default_context + '/edit');

                         }


                    }
                    else {

                        // TODO find a better way of dealing with Edit and Delete

                    var receiver = res.locals.user.uid;
                    var perceiver = res.locals.user.uid;
                    var showcontexts = req.query.showcontexts;
                    var fullview = res.locals.user.fullview;
                    var contexts = [];

                    contexts.push(default_context);

                    Entry.getNodes(receiver, perceiver, contexts, fullview, showcontexts, res, req, function(err, graph){
                        if (err) return next(err);

                        // Change the result we obtained into a nice json we need
                        res.send({entryuid: answer, entrytext: statement, graph: graph});

                    });

                    }



                }
            });
        }
    });


};
