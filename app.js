require('dotenv-extended').load();
var restify = require('restify');
var builder = require('botbuilder');

var bot = require('./bot');
var api = require('./api');

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var chatBot = bot.create(connector);

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
server.use(restify.queryParser());
server.post('/api/messages', connector.listen());
server.get('/authCallback', authCallback)
server.get('/authCallbackServer', authCallbackServer)
// server.get('/authCode', authCode)

function authCallback(req, res, next) {
    var body = "<html><body><script>document.write(window.location.hash.split('#')[1].split('&')[0].split('=')[1]);</script></body></html>";
    res.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/html'
    });
    res.write(body);
    res.end(); 
    next();
}

function authCallbackServer(req, res, next) {
    var body = "<html><body>You can close this window and return to bot</body></html>";
    var b = new Buffer(req.params.state, 'base64')
    var state = JSON.parse(b.toString()); // resumption;

    api.oauthCodeExchangeForAuth(req.params.code)
        .then(function(result){
            console.log(result);
            var session = chatBot.loadSession(state, function(error, session){
                session.userData.access_token = JSON.parse(result).access_token;
                session.send("You are authorized now!");
            });            
            chatBot.send(reply);
        }).catch(function(e){
            console.log("Catch handler " + e);                            
        });

    res.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/html'
    });
    res.write(body);
    res.end(); 
    next();
}
