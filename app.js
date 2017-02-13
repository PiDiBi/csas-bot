require('dotenv-extended').load();
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var async = require('async');
var Promise = require('bluebird');

var api = require('./api');
var ui = require('./ui');

var CSAS_API_KEY = process.env.CSAS_API_KEY;
var PORT = process.env.port || process.env.PORT || 3978;
var HOSTNAME = process.env.WEBSITE_HOSTNAME ? ("https://" + process.env.WEBSITE_HOSTNAME) : ("http://localhost" + ":" + PORT);
// use demo user : 7777777777 / any password
// token type url
var useServerSideOAuth = false;
var authCallbackUrl = 'https://api.csas.cz/sandbox/widp/oauth2/auth?state=profil&redirect_uri='+HOSTNAME+'/authCallback&client_id=WebExpoClient&response_type=token';
// code type url - server side
var authCallbackUrlCode = 'https://api.csas.cz/sandbox/widp/oauth2/auth?state=profil&redirect_uri='+HOSTNAME+'/authCallbackServer&client_id=WebExpoClient&response_type=code';
var authCodeUrl = 'https://api.csas.cz/sandbox/widp/oauth2/auth';


//=========================================================
// Bot Setup
//=========================================================

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector, [    
    function (session) {
        session.send("Hello... I'm a CSAS bank bot.");
        //session.userData.access_token = "";
        session.userData.accounts = {};
        session.beginDialog('rootMenu');
    }
]);

bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
                .address(message.address)
                .text("Hello %s...  I'm a CSAS bank bot.", name || 'there');
        bot.send(reply);
        bot.beginDialog(message.address, "rootMenu")
    } else {
        // delete their data
    }
});
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        var name = message.user ? message.user.name : null;
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                var reply = new builder.Message()
                    .address(message.address)
                    .text("Hello %s...  I'm a CSAS bank bot.", name || 'there');
                bot.send(reply);
                bot.beginDialog(message.address, "rootMenu")
            }
        });
    }
});
//"Hello " + name || 'there' +"...  I'm CSAS bank bot. Thanks for adding me. Say 'hello' to start."

bot.dialog('rootMenu', [
    function (session) {
        builder.Prompts.choice(session, "Select", "Accounts|Cards");
    },
    function (session, results) {
        switch (results.response.index) {
            case 0:
                session.replaceDialog('selectAccountMenu');        
                break;
            case 1:
                session.replaceDialog('selectCardMenu');
                break;        
                
            default:
                break;
        }
        
    },
    function (session) {
        // Reload menu
        session.replaceDialog('rootMenu');
    }
])
.reloadAction('showMenu', null, { matches: /^(menu|help|\?)/i })
.triggerAction({ matches: /^(home|\?)/i });;

bot.dialog('authorizeDialog', [
    function (session, nextDialog) { //, next)
        session.dialogData.nextDialog = nextDialog; 
        session.userData.accountsPrompt = [];
        session.send("You are not authorised. \n\r Click on the URL to authorize yourself and send me code you will see.");
        builder.Prompts.text(session, useServerSideOAuth ? authCallbackUrlServer :  authCallbackUrl);            
    },
    function (session, results, next) {
        // next is next waterfall
        if (results.response) {
            session.userData.access_token = results.response;
            session.replaceDialog(session.dialogData.nextDialog);
        }
        else{
            //err();
        }         
    }
])
.reloadAction('showMenu', null, { matches: /^(menu|help|\?)/i });

bot.dialog('selectAccountMenu', [
    function (session) {
        api.refreshAccounts(session)
        .then(function(result){
                builder.Prompts.choice(session, "Select your account", getAccountsPromt(session));
            }
        )        
        .catch(function(e){
            console.log("Catch handler " + e)
            authorize(session, 'selectAccountMenu');
        });
                
    },
    function (session, results) {
        session.userData.acountIndex = results.response.index;        
        session.replaceDialog('accountDialog');
    },
    function (session) {
        // Reload menu
        session.replaceDialog('selectAccountMenu');
    }
])
.reloadAction('showMenu', null, { matches: /^(menu|help|\?)/i })
.triggerAction({ matches: /^(accounts|\?)/i });;

bot.dialog('accountDialog', [
    function (session) {
        builder.Prompts.choice(session, "What do you want to do? Type 'accounts' to return to account selection or 'home'", "Show balance|Show history");
    },
    function (session, results) {
        switch (results.response.index) {
            case 0:
                session.send(ui.accountBalance(session.userData.accounts.accounts[session.userData.acountIndex]));                
                session.replaceDialog('accountDialog');          
                break;
            case 1:                
                api.accountHistory(session)
                    .then(function(result){
                            var history = '';
                            session.userData.accountHistory.transactions.forEach(function(transaction) {                        
                                    history += ui.transactionDetail(transaction);
                            }, this);                
                            session.send(history);   
                            session.replaceDialog('accountDialog');  
                        }
                    )        
                    .catch(function(e){
                        console.log("Catch handler " + e)
                        authorize(session, 'accountDialog');
                    });
                
                break;            
            default:                
                break;
        }
        
    },
    function (session) {
        // Reload menu
        session.replaceDialog('accountDialog');
    }
])
.reloadAction('showMenu', null, { matches: /^(menu|help|\?)/i });


bot.dialog('selectCardMenu', [
    function (session) {
        api.refreshCards(session)
        .then(function(result){
                builder.Prompts.choice(session, "Select your card to show more info", getCardsPromt(session));    
            }
        )        
        .catch(function(e){
            console.log("Catch handler " + e)
            authorize(session, 'selectCardMenu');
        });                      
    },
    function (session, results) {
        session.userData.cardIndex = results.response.index;        
        var cardBalance = ui.cardBalance(session.userData.cards.cards[session.userData.cardIndex]);                
        session.send(cardBalance);
        session.replaceDialog('selectCardMenu');
    }
])
.reloadAction('showMenu', null, { matches: /^(menu|help|\?)/i })
.triggerAction({ matches: /^(cards|\?)/i });;

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
server.use(restify.queryParser());
server.post('/api/messages', connector.listen());
server.get('/authCallback', authCallback)
// server.get('/authCallbackServer', authCallbackServer)
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

function getAccountsPromt(session)
{
    var accountsPrompt = [];
    session.userData.accounts.accounts.forEach(function(account) {        
        accountsPrompt.push(ui.accountNumber(account));
    }, this);
    return accountsPrompt;
}
function getCardsPromt(session)
{
    var cardsPrompt = [];
    session.userData.cards.cards.forEach(function(card) {        
        cardsPrompt.push(ui.shortCardInfo(card));
    }, this);
    return cardsPrompt;
}
 function authorize(session, nextDialog)
{        
    session.replaceDialog('authorizeDialog', nextDialog);
}