var restify = require('restify');
var builder = require('botbuilder');
var CSAS_API_KEY = process.env.CSAS_API_KEY;
// use demo user : 7777777777 / any password
// WEB-API-KEY
// var authCallbackUrl = https://api.csas.cz/sandbox/widp/oauth2/auth?state=profil&redirect_uri=https://api.csas.cz/sandbox/widp/oauth2/redirect&client_id=WebExpoClient&response_type=token
// token type url
var authCallbackUrl = 'https://api.csas.cz/sandbox/widp/oauth2/auth?state=profil&redirect_uri=http://localhost:3978/authCallback&client_id=WebExpoClient&response_type=token';
// code type url
//var authCallbackUrl = 'https://api.csas.cz/sandbox/widp/oauth2/auth?state=profil&redirect_uri=http://localhost:3978/authCallback&client_id=WebExpoClient&response_type=code';
var authCodeUrl = 'https://api.csas.cz/sandbox/widp/oauth2/auth';
var request = require('request');

//=========================================================
// Bot Setup
//=========================================================

// Create chat bot
var connector = new builder.ChatConnector({
    //appId: process.env.MICROSOFT_APP_ID,
    //appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector, [    
    function (session) {
        session.beginDialog('authoriseDialog');
    }
]);


bot.dialog('authoriseDialog', [
    function (session) {
        session.userData.accountsPrompt = [];
        session.send("Hello... I'm a bank bot. You are not authorised. \n\r Click on the URL to authorize yourself and send me code you will see.");
        builder.Prompts.text(session, authCallbackUrl);                
    },
    function (session, results) {
        if (results.response) {
            session.userData.access_token = results.response;
            request({
            method: 'GET',
            url: 'https://api.csas.cz/sandbox/webapi/api/v3/netbanking/my/accounts?size=&page=&sort=&order=&type=',
            headers: {
                'WEB-API-key': CSAS_API_KEY,
                //'Authorization': 'Bearer demo_001'
                'Authorization': session.userData.access_token
            }}, function (error, response, body) {
                if(response.statusCode==403)
                {
                    //session.endDialog("Not authorised.");
                    session.replaceDialog('authoriseDialog');                    
                    return;
                }                 
                session.userData.csasResponse = JSON.parse(body);                
                session.userData.accountsPrompt = [];
                session.userData.csasResponse.accounts.forEach(function(account) {        
                    session.userData.accountsPrompt.push(account.accountno.number + '/' + account.accountno.bankCode);
                }, this);
                session.replaceDialog('rootMenu');
            });            
        }
        else{
            session.replaceDialog('rootMenu');
        }         
    }    
])
.reloadAction('showMenu', null, { matches: /^(menu|help|\?)/i });

bot.dialog('rootMenu', [
    function (session) {
        if(session.userData.accountsPrompt.length>0)
        {
            builder.Prompts.choice(session, "Select your account", session.userData.accountsPrompt);        
        }   
        else{
            session.replaceDialog('authoriseDialog');
        }                     
    },
    function (session, results) {
        session.userData.acountIndex = results.response.index;        
        session.beginDialog('accountDialog');
    },
    function (session) {
        // Reload menu
        session.replaceDialog('rootMenu');
    }
])
.reloadAction('showMenu', null, { matches: /^(menu|help|\?)/i })
.triggerAction({ matches: /^(accounts|back|\?)/i });;


bot.dialog('accountDialog', [
    function (session) {
        builder.Prompts.choice(session, "What do you want to do? (type 'accounts' to return to account selection')", "Show balance|Show history");
    },
    function (session, results) {
        switch (results.response.index) {
            case 0:
                session.send(session.userData.csasResponse.accounts[session.userData.acountIndex].balance.value + " " + session.userData.csasResponse.accounts[session.userData.acountIndex].balance.currency);
                session.replaceDialog('accountDialog');
                break;
            case 1:
                request({
                    method: 'GET',
                    url: 'https://api.csas.cz/sandbox/webapi/api/v1/netbanking/my/accounts/id/transactions?dateStart=2014-06-01T00%3A00%3A00%2B02%3A00&dateEnd=2014-06-30T00%3A00%3A00%2B02%3A00',
                    headers: {
                        'WEB-API-key': CSAS_API_KEY,
                        'Authorization': session.userData.access_token
                    }}, function (error, response, body) {
                        if(response.statusCode == 403)
                        {
                            session.replaceDialog('authoriseDialog');
                            return;
                        }
                        session.userData.history = JSON.parse(body);
                        console.log('Status:', response.statusCode);
                        var histText = '';
                        session.userData.history.transactions.forEach(function(transaction) {                        
                            histText += transaction.amount.value + " " + transaction.amount.currency  + " - " + transaction.description + "\n\r";
                        }, this);
                        session.send(histText);         
                        session.replaceDialog('accountDialog');               
                });
                break;            
            default:
                session.replaceDialog('accountDialog');
                break;
        }
        
    },
    function (session) {
        // Reload menu
        session.replaceDialog('accountDialog');
    }
])
.reloadAction('showMenu', null, { matches: /^(menu|help|\?)/i })
.cancelAction('cancelAction', "Canceled.", { 
      matches: /(home|^cancel)/i,
      confirmPrompt: "Are you sure?"
});


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
server.use(restify.queryParser());
server.post('/api/messages', connector.listen());
server.get('/authCallback', authCallback)

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
