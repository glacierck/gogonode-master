// Import library to generate UID for statements
var uuid = require('node-uuid');

// Import string processing libraries
var S = require('string');

// Import Hashtag extraction library
var FlowdockText = require('flowdock-text');

// Options for Stack Overflow
var options = require('../../options');


// Stemming module initialization
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();

// Lemmatizer module initialization

// var Lemmer = require('node-lemmer').Lemmer;
var Lemmer =function () {
    return false;
};
var lemmerEng = new Lemmer('english');
var lemmerRus = new Lemmer('russian');

// Language detection
var LanguageDetect = require('languagedetect');
var lngDetector = new LanguageDetect();

var neo4j = require('node-neo4j');
dbneo = new neo4j(options.neo4jlink);



function parseField(field) {
    return field
        .split(/\[|\]/)
        .filter(function(s){ return s });
}


function getField(req, field) {
    var val = req.body;
    field.forEach(function(prop){
        val = val[prop];
    });
    return val;
}

function uniques(a) {
    if (a.length === 1) { return a };
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
        var item = a[i];
        if(seen[item] !== 1 && item.length > 0) {
            seen[item] = 1;
            out[j++] = item;
        }
    }
    return out;
}

// AUXILIARY FUNCTIONS

// Function to extract hashtags from any input

function extractHashtags(statement) {

    var hashtags = FlowdockText.extractHashtags(statement);

    // Convert them to lowercase
     for (var i = 0; i < hashtags.length; i++) {

            hashtags[i] = hashtags[i].toLowerCase();

    }
    return hashtags;
}

// Function to extract concepts from any input

function extractConcepts(statement, morphemes, hashnodes) {




    // Get rid of the @contexts in the statement
    statement = statement.replace(/@\S+/g, '');

    // Get rid of the single and double quotes in the statement
    //statement = statement.replace(/['"]+/g, '');

    // Single quotation mark
    statement = statement.replace(/[’]+/g, ' ');

    // Get rid of the links in the statement - we need only hashtags and concepts
    statement = statement.replace(/(?:https?|ftp):\/\/\S+/g, '');

    console.log('we are processing the ' + statement);
    // Detect language
    var lngDetected = lngDetector.detect(statement, 4);

    console.log(lngDetected);

    // A rather complicated way of detecting language because language detect module works like shit
    var lng = 'undefined';

    var lngmarker = '';

    for (var i = 0; i<lngDetected.length; ++i) {
        if (lngDetected[i][0] == 'russian' || lngDetected[i][0] == 'macedonian' || lngDetected == 'slovak' || lngDetected == 'serbian') {

            lng = 'russian';
            lngmarker = 'detected';
        }
        else if (lngDetected[i][0] == 'english') {

            lng = 'english';
            lngmarker = 'detected';
        }
        else {
            if (lngDetected[i][0] == 'german' || lngDetected[i][0] == 'italian' || lngDetected[i][0] == 'french' || lngDetected[i][0] == 'spanish') {

                // If we detect one of the languages above on top of the list, mark it as default language
                if (lngmarker != 'detected') {
                    lng = lngDetected[i][0];
                    lngmarker = 'detected';
                }

            }
        }
    }

    lng = 'undefined';

    // Get a list of stopwords from settings
    // TODO load stopword corrections from user's settings

    var stopwords = options.stopwords_en;

    if (lng == 'russian') {
        var stopwords = options.stopwords_ru;
    }

    if (lng == 'german') {
        var stopwords = options.stopwords_de;
    }

    if (lng == 'french') {
        var stopwords = options.stopwords_fr;
    }

    if (lng == 'spanish') {
        var stopwords = options.stopwords_es;
    }


    // #Hashtags should not be lemmatized? Then extract them as they are and remove them from the statement.

    var hashtags = [];

    if (morphemes != 1) {

        hashtags = FlowdockText.extractHashtags(statement);

        // Convert them to lowercase
        for (var i = 0; i < hashtags.length; i++) {

                hashtags[i] = hashtags[i].toLowerCase();

        }

    }

    var concepts = [];

    if (lng == 'russian' || lng == 'german' || lng == 'french') {

        // Split the statement into tokens (words)

        var conceptsRaw = statement.toLowerCase().replace(/[.,!?;:-]/g, '').replace(/#+/g, '').split(/\s+/);

        for (var i = 0; i < conceptsRaw.length; i++) {
            if (conceptsRaw[i] != undefined && conceptsRaw[i] != null && conceptsRaw[i] != "") {
                concepts.push(conceptsRaw[i].replace(/['"]+/g, '').replace(/\\/g, ''));
            }
        }

    }

    else {

        concepts = tokenizer.tokenize(statement.toLowerCase());

    }



    // Make an array of concepts that are not in the stoplist and longer than 1 character OR the ones that belong to hashtags

    var conceptsclean = [];

    for (var i = 0; i < concepts.length; i++) {
        if ((stopwords.indexOf(concepts[i]) == -1  && concepts[i].length > 1) || hashtags.indexOf(concepts[i]) > -1) {
            conceptsclean.push(concepts[i]);
        }
    }


    // Now find lemmas for every concept

    var lemmas = [];

    // There are hashtags and they should not be lemmatized

    if (hashtags[0] != null && morphemes != 1) {

        for (var i = 0; i < conceptsclean.length; ++i) {

            // This concept is a hashtag? Then add it to the list of lemmas unchanged

            if (hashtags.indexOf(conceptsclean[i]) > -1) {

                var hashtag_array = [{
                        text: conceptsclean[i],
                        partOfSpeech: 'unchanged'
                }];

                lemmas.push(hashtag_array);
            }

            // It's not a hashtag

            else {

                if (lng == 'russian') {
                    lemmas.push(lemmerRus.lemmatize(conceptsclean[i]));
                }
                else if (lng == 'english') {
                    lemmas.push(lemmerEng.lemmatize(conceptsclean[i]));
                }
                else {
                    var hashtag_array = [{
                        text: conceptsclean[i],
                        partOfSpeech: 'unchanged'
                    }];

                    lemmas.push(hashtag_array);
                }
            }

        }

    }

    // There are hashtags or no hashtags and both words and hashtags should be lemmatized

    else {

        for (var i = 0; i < conceptsclean.length; ++i) {
            if (lng == 'russian') {
                lemmas.push(lemmerRus.lemmatize(conceptsclean[i]));
            }
            else if (lng == 'english') {
                lemmas.push(lemmerEng.lemmatize(conceptsclean[i]));
            }
            else {
                var hashtag_array = [{
                    text: conceptsclean[i],
                    partOfSpeech: 'unchanged'
                }];

                lemmas.push(hashtag_array);
            }
        }
    }
    console.log(lemmas);

    // Get the first result and make a clean array
    // TODO find a way to better process multiple results, e.g. return the shortest word

    var lemmasclean = [];

    for (var i = 0; i < lemmas.length; ++i) {
        if (lemmas[i][0] != undefined) {
            lemmasclean.push(lemmas[i][0]['text'].toLowerCase());
        }
    }


    return lemmasclean;
}


// Function to extract context from any input

function extractMentions(statement) {

    var mentions = FlowdockText.extractMentions(statement);

    // Convert them to lowercase
    for (var i = 0; i < mentions.length; i++) {

        mentions[i] = mentions[i].toLowerCase();

        // makes sure the context name is safe
        mentions[i] = mentions[i].replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"_");
    }

    return mentions;
}


// EXPORTS FOR VALIDATION PURPOSES


// Checks if the user is logged in

exports.isLoggedIn = function(){
    return function(req, res, next){
        if (! res.locals.user) {
            res.error('Please, log in or register first.');
            res.redirect('back');
        } else {
            next();
        }
    }
};



// Checks if the statement should be deleted or edited

exports.isToDelete = function(){
    return function(req, res, next){

        // Are we here to delete, to edit, or are we just passing by?

        console.log('reqbody');
        console.log(req.body);
        if (req.body.delete == 'delete' || req.body.edit == 'edit' || req.body.delete == 'delete context') {


            var delete_query = [];

            if (req.body.delete == 'delete context') {

                var idQuery = 'MATCH (u:User{uid:"' + res.locals.user.uid + '"}), (ctx:Context{name:"' + req.body.context + '"}), ctx-[:BY]->u RETURN ctx.uid;';

                console.log(idQuery);

                dbneo.cypherQuery(idQuery, function(err, uid){

                    if(err) {
                        err.type = 'neo4j';
                        return fn(err);
                    }

                    // Pass this on to the next function

                    var context_id = uid.data[0];

                    console.log(uid.data[0]);

                    // Delete TO and OF types of relationships for Concepts and BY type of relationship for Statements (they include context ID)
                    delete_query[0] = 'START rel=relationship:relationship_auto_index(context="' + context_id + '") ' +
                                      'DELETE rel;';

                    // Then delete the remaining relationships (AT, IN) and BY for concepts and Statements
                    delete_query[1] = 'MATCH (ctx:Context{uid:"' + context_id + '"}), ' +
                                      's-[in:IN]->ctx ' +
                                      'DELETE s,in;';


                    // Then delete the remaining relationships (AT, IN) and BY for concepts and Statements
                    delete_query[2] = 'MATCH (ctx:Context{uid:"' + context_id + '"}), ' +
                        '(c:Concept), c-[at]->ctx  ' +
                        'DELETE at;';

                    // Then delete the remaining relationships (AT, IN) and BY for concepts and Statements
                    delete_query[3] = 'MATCH (ctx:Context{uid:"' + context_id + '"}), ' +
                                      '(u:User), ctx-[by]-u ' +
                                      'DELETE ctx,by;';


                    console.log(delete_query);

                    deleteContext(goBackContext);


                });



            }
            else {
                // A query for when there's more than 1 hashtag/concept - we also need it for editing as the edited st is deleted first

                delete_query[0] = 'START rel=relationship:relationship_auto_index(statement="' + req.body.statementid + '") ' +
                                  'DELETE rel;';

                delete_query[1] = 'MATCH (s:Statement{uid:"' + req.body.statementid + '"}), ' +
                                  's-[by:BY]->u, s-[in:IN]->ctx, c-[of:OF]->s ' +
                                  'DELETE by,in,of,s;';


                // Now let's check if the user wants to delete or edit a node

                if (req.body.delete == 'delete') {

                    if (req.body.statementid) {

                        console.log(delete_query);

                        deleteStatement(goBack);

                    }
                    else {

                        res.error('Sorry, but we did not get the ID of what you wanted to delete.');
                        res.redirect('back');

                    }

                }

                // If we want to edit the node, we simply delete it and then pass on the data to entries.submit to add a new one

                else if (req.body.edit == 'edit') {

                    if (req.body.statementid) {

                        console.log(delete_query);
                        deleteStatement(moveOn);

                    }
                    else {

                        res.error('Sorry, but we did not get the ID of what you wanted to edit.');
                        res.redirect('back');

                    }


                }
            }




        }

        // Neither delete, nor edit, so we move on to entries.submit (adding a new statement, that is)

        else {

            next();

        }


        // Constructing transation for Neo4J operation

        function deleteStatement (callback) {

            dbneo.beginAndCommitTransaction({
                statements : [ {
                                    statement : delete_query[0],
                                    resultDataContents : [ 'row', 'graph' ]
                               },
                                {
                                    statement : delete_query[1],
                                    resultDataContents : [ 'row', 'graph' ]
                                }
                ]
            }, function(err, cypherAnswer){

                    if(err) {
                        err.type = 'neo4j';
                        return callback(err);
                    }
                    // No error? Pass the contexts to makeQuery function
                    callback(null,cypherAnswer);


            });



        }


        // Constructing transation for Neo4J operation

        function deleteContext (callback) {

            dbneo.beginAndCommitTransaction({
                statements : [ {
                    statement : delete_query[0],
                    resultDataContents : [ 'row', 'graph' ]
                    },
                    {
                        statement : delete_query[1],
                        resultDataContents : [ 'row', 'graph' ]
                    },
                    {
                        statement : delete_query[2],
                        resultDataContents : [ 'row', 'graph' ]
                    },
                    {
                        statement : delete_query[3],
                        resultDataContents : [ 'row', 'graph' ]
                    }
                ]
            }, function(err, cypherAnswer){

                if(err) {
                    err.type = 'neo4j';
                    return callback(err);
                }
                // No error? Pass the contexts to makeQuery function
                callback(null,cypherAnswer);


            });



        }

        // That's in case we want to go back (when deleted, for example)

        function goBack (err,answer) {

            // Error? Display it.
            if (err) {
                console.log(err);
                res.send({errormsg: 'Sorry, something went wrong on the Deleting part...'});
            }
            else {
                // If all is good, make a message for the user and send him back
                res.send({successmsg: 'The statement was removed.', statementid: req.body.statementid});
            }

        }

        function goBackContext (err,answer) {

            // Error? Display it.
            if (err) {
                console.log(err);
                res.error('Sorry, something went wrong on the Deleting part...');
                res.redirect('back');
            }
            else {

                // If all is good, make a message for the user and send him back
                res.error('The whole list was removed.');
                res.redirect('back');
            }

        }

        // That's when we want to move on (when deleted and adding a new one

        function moveOn (err,answer) {

            // Error? Display it.
            if (err) {
                console.log(err);
                res.send({errormsg: 'Sorry, something went wrong on the Editing part...'});
//                res.redirect('back');
            }
            else {
                // If all is good, movemove on
                // res.send({successmsg: 'Edited the statement and added at the top of the list.'});
                next();
            }

        }

    }
};



exports.changeContextPrivacy = function(){
    return function(req, res, next){

        // Does the user want to change context privacy from private to public?
        // Get the parameters from the button submitted

        var privacyquery = '';

        if (req.body.privacy == 'make public') {

                if (!req.body.context) {
                    res.error('You did not specify a graph');
                    res.redirect('back');
                }
                else {
                    privacyquery = 'MATCH (u:User{uid:"' + res.locals.user.uid + '"}), (ctx:Context{name:"' + req.body.context + '"}), ctx-[:BY]->u WITH DISTINCT ctx SET ctx.public = "1";';
                }

                console.log(privacyquery);

                dbneo.cypherQuery(privacyquery, function(err, uid){

                    if(err) {
                        err.type = 'neo4j';
                        return fn(err);
                    }

                    else {
                        res.error('The graph is now public.');
                        res.redirect('back');
                    }

                });

        }

        // Does the user want to change the context to private ?
        // Get the parameters fromt he button submitted

        else if (req.body.privacy == 'make private') {

            if (!req.body.context) {
                res.error('You did not specify a graph');
                res.redirect('back');
            }
            else {
                privacyquery = 'MATCH (u:User{uid:"' + res.locals.user.uid + '"}), (ctx:Context{name:"' + req.body.context + '"}), ctx-[:BY]->u WITH DISTINCT ctx SET ctx.public = null;';
            }

            console.log(privacyquery);

            dbneo.cypherQuery(privacyquery, function(err, uid){

                if(err) {
                    err.type = 'neo4j';
                    return fn(err);
                }

                else {
                    res.error('This graph is now private.');
                    res.redirect('back');
                }

            });

        }
        else {
            res.error('You asked to change the graph privacy setting, but provided no settings.');
            res.redirect('back');
        }

    }
};



// Function to sanitize input and clean it from all the apostrophes. TODO: Think of a better option, maybe like jesc

exports.sanitize = function(statement){

        var result = statement;
        result = S(result).trim().collapseWhitespace().s;
        result = result.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');

        console.log("Text body normalized: " + result);

        return result;

};


// Extract hashtags from a statement

exports.getHashtags = function(statement, res) {


        val = statement;

        var hashtags = [];

        // Hashtags are given priority over words? Get them from the statement

        var hashnodes = 0;

        if (!res.locals.user.hashnodes) {
            hashnodes = 0;
        }
        else {
            hashnodes = res.locals.user.hashnodes;
        }

        if (hashnodes != 1) {
            hashtags = extractHashtags(val);
        }


        var morphemes = 0;

        if (!res.locals.user.morphemes) {
            morphemes = 0;
        }
        else {
            morphemes = res.locals.user.morphemes;
        }

        // If there were no hashtags, extract every word from a statement
        // But only if there is no setting that only hashtags should be extracted

        if (hashtags[0] == null && hashnodes != 2) {
            hashtags = extractConcepts(val, morphemes, hashnodes);
        }

        var maxhash = options.settings.max_hashtags;

        if (hashtags[0] != null && hashtags.length < maxhash) {
            console.log("Hashtags extracted: " + hashtags);

        }

        return hashtags;
}


// Extract context from the statement

// TODO this will be turned into extracting a mention for a different type of add

exports.getMentions = function(statement) {

       // Contexts extracted from the statement entry form (@mentions)

        var mentions = extractMentions(statement);

        console.log('extracted mentions:');
        console.log(mentions);

        return mentions;

}


exports.getContextForEntry = function(field) {
    field = parseField(field);
    var that = this;
    return function(req,res,next) {

        var addToContexts = [];

        // This is a list of contexts we received with submission
        var addedContexts = req.body.addedContexts;

        // Are they comma separated?
        if (addedContexts.indexOf(',') > 0) {
            // Yes? Split and make an array
            addToContexts = addedContexts.split(',');
        }
        else if (addedContexts.length > 0) {
            // No? just add the value in the string into the array
            addToContexts.push(addedContexts);
        }
        else {
            var errormsg = 'Please, choose at least one context for your statement.';
            //res.error(errormsg);
            res.send({errormsg: errormsg});
        }


        console.log('contexts submitted');
        console.log(addToContexts);

        if (addToContexts.length > 0) {
            that.getContextID(res.locals.user.uid, addToContexts, function(result, err) {

                if (err) {
                    res.error('Something went wrong when adding new lists into Neo4J database. Try changing the list name or open an issue on GitHub.');
                    res.redirect('back');
                }
                else {
                    var contexts = result;
                    req.contextids = contexts;
                    console.log('contexts retrieved from db');
                    console.log(req.contextids);
                    next();
                }
            });
        }


    }
}

// Finding out if the context is private

exports.getContextPrivacy = function(){

    return function(req, res, next){

        // Do we have context name we want to check for privacy setting?

        if (req.params.context) {

            // Let's find what user we need

            var contextforuser = '';

            if (res.locals.user) {
                contextforuser = res.locals.user.name;
            }
            else {
                contextforuser = req.params.user;
            }


            var contextname = req.params.context;
            contextname = S(contextname).trim().collapseWhitespace().s;
            contextname = contextname.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');

            var query = 'MATCH (u:User{name:"' + contextforuser + '"}), (ctx:Context{name:"' + contextname + '"}), ctx-[:BY]->u RETURN DISTINCT ctx.public;';

            console.log('Query if the context is public?');
            console.log(query);

            obtainContextPrivacy(passContext);

        }

        // There's no ID of the context in the URL to look, so ok...
        else {


            // TODO this will be the case for view all - process it separately
            next();


        }


        // Here we get the context privacy of the context made by the user

        function obtainContextPrivacy (callback) {
            dbneo.cypherQuery(query, function(err, cypherAnswer){

                if(err) {
                    err.type = 'neo4j';
                    return callback(err);
                }
                // No error? Pass the contexts to makeQuery function
                callback(null,cypherAnswer);


            });
        }

        // Here we pass it on to res. variable

        function passContext (err,answer) {

            // Error? Display it.
            if (err) console.log(err);

            // So we take the answer, which is the context privacy setting of the context we want to view, and give it to res variable
            res.locals.contextpublic = answer.data[0];

            next();

        }



    }
};


exports.getContextID = function(user_id, addToContexts, finalCallback) {



    var contexts = [];

    for (var l=0; l < addToContexts.length; l++) {
        addToContexts[l] = addToContexts[l].replace(/[^\w]/gi, '');
    }

    contexts = uniques(addToContexts);

    console.log('contexts uniqualized');
    console.log(contexts);

    var context_query = 'MATCH (u:User{uid:"'+user_id+'"}), (c:Context), c-[:BY]->u WHERE ';

    // Foreach context get the right query

    contexts.forEach(function(element) {
        context_query += 'c.name = "'+element+'" OR ';
    });

    context_query += ' c.name = "~~~~dummy~~~~" RETURN DISTINCT c;';


    getContexts(makeQuery);

    // This will get the contexts from the database

    function getContexts (callback) {

        dbneo.cypherQuery(context_query, function(err, cypherAnswer){

            if(err) {
                err.type = 'neo4j';
                return callback(err);
            }

            // we have our answer, call the callback
            callback(null, cypherAnswer);

       });



    }

    function makeQuery (err,answer) {

        // Error? Display it.
        if (err) console.log(err);

        // Define where we store the new contexts
        var newcontexts = [];

        // This is an array to check if there are any contexts that were not in DB
        var check = [];

        // Go through all the contexts we received from DB and create the newcontexts variable from them
        for (var i=0;i<answer.data.length;i++) {
            newcontexts.push({
                uid: answer.data[i].uid,
                name: answer.data[i].name
            });
            check.push(answer.data[i].name);
        }

        // Now let's check if there are any contexts that were not in the DB, we add them with a unique ID
        contexts.forEach(function(element){
            if (check.indexOf(element) < 0) {
                newcontexts.push({
                    uid: uuid.v1(),
                    name: element
                });
            }
        });

        var timestamp = new Date().getTime() * 10000;

        // Now let's create those contexts that are not yet created

        var matchUser = 'MATCH (u:User {uid: "' + user_id + '"}) ';

        // Add context query

        var createContexts = '';

        for (var indx = 0; indx < newcontexts.length; ++ indx) {

            //Build context query
            createContexts += 'MERGE (' + 'c_' + newcontexts[indx].name + ':Context ' + '{name:"' + newcontexts[indx].name + '",by:"' + user_id + '",uid:"'+newcontexts[indx].uid+'"}) ON CREATE SET ' + 'c_' + newcontexts[indx].name + '.timestamp="' + timestamp + '" MERGE ' + 'c_' + newcontexts[indx].name + '-[:BY{timestamp:"' + timestamp + '"}]->u ';

        }

        var query = matchUser + createContexts;

        dbneo.cypherQuery(query, function(err, cypherAnswer){

            if(err) {
                err.type = 'neo4j';
                console.log(err);
                console.log(query);
                finalCallback(null, err);

            }
            else {

                finalCallback(newcontexts);
            }


        });



    }




};





// How to know user's ID from their name
// TODO This function should probably go somewhere else, not so cool to have Cypher query in here also

exports.getUserID = function(){

    return function(req, res, next){

        // Do we have user ID we want to view in our URL?

        if (req.params.user) {

            // We do? Sanitize it
            var userid = req.params.user;
            userid = S(userid).trim().collapseWhitespace().s;
            userid = userid.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');

            // Then get the ID and pass it on further along the line...

            var query = 'MATCH (u:User{name:"' + userid + '"}) RETURN u.uid';

            obtainUserID(passOn);

        }

        // There's no ID of the user in the URL to look, ok...
        else {


            // Is the one who's trying to view logged in?
            if (! res.locals.user) {

                // Not logged in? Well, then let's pass the user further along the line
                res.locals.viewuser = '';
                next();


            } else {

                // Aha, he's logged in and he doesn't say which users he wants, so we show him himself

                res.locals.viewuser = res.locals.user.uid;
                next();

            }
        }


        // Here we get the ID of the user

        function obtainUserID (callback) {
            dbneo.cypherQuery(query, function(err, cypherAnswer){

                if(err) {
                    err.type = 'neo4j';
                    return callback(err);
                }
                // No error? Pass the contexts to makeQuery function
                callback(null,cypherAnswer);


            });
        }

        // Here we pass it on to res. variable

        function passOn (err,answer) {

            // Error? Display it.
            if (err) {
                console.log(err);
                res.error('This user does not exist.');
                res.redirect('/');
            }

            // So we take the answer, which is the ID of the user we want to view, and give it to res variable
            if (answer.data[0]) {
                res.locals.viewuser = answer.data[0];
                next();
            }
            else {
                res.redirect('/' + req.params.user + '/error/404');
            }

        }



    }
};




exports.getDefaultUser = function(){

    return function(req, res, next){

        // Do we have user ID we want to view in our URL?

            req.params.user = options.default_user;

            var query = 'MATCH (u:User{name:"' + options.default_user + '"}) RETURN u.uid';

            console.log(query);
            obtainUserID(passOn);



        // Here we get the ID of the user

        function obtainUserID (callback) {
            dbneo.cypherQuery(query, function(err, cypherAnswer){

                if(err) {
                    err.type = 'neo4j';
                    return callback(err);
                }
                // No error? Pass the contexts to makeQuery function
                callback(null,cypherAnswer);


            });
        }

        // Here we pass it on to res. variable

        function passOn (err,answer) {

            // Error? Display it.
            if (err) {
                console.log(err);
                res.redirect('/login');
            }

            if (answer.data[0]) {
                res.locals.viewuser = answer.data[0];
                console.log(answer);
                next();
            }
            else {
                res.redirect('/login');
            }

            // So we take the answer, which is the ID of the user we want to view, and give it to res variable



        }



    }
};

exports.safe_tags = function (str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
}



