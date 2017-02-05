var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var async = require('async');

var api = require('./api');
var ui = require('./ui');

var CSAS_API_KEY = process.env.CSAS_API_KEY;
var PORT = process.env.port || process.env.PORT || 3978;
var HOSTNAME = process.env.WEBSITE_HOSTNAME ? ("https://" + process.env.WEBSITE_HOSTNAME) : ("http://localhost" + ":" + PORT);
// use demo user : 7777777777 / any password
// token type url
var authCallbackUrl = 'https://api.csas.cz/sandbox/widp/oauth2/auth?state=profil&redirect_uri='+HOSTNAME+'/authCallback&client_id=WebExpoClient&response_type=token';
// code type url
//var authCallbackUrl = 'https://api.csas.cz/sandbox/widp/oauth2/auth?state=profil&redirect_uri=http://localhost:3978/authCallback&client_id=WebExpoClient&response_type=code';
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
        session.beginDialog('authoriseDialog');
    }
]);

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

bot.dialog('authoriseDialog', [
    function (session) {
        session.userData.accountsPrompt = [];
        session.send("Hello... I'm a bank bot. You are not authorised. \n\r Click on the URL to authorize yourself and send me code you will see.");
        builder.Prompts.text(session, authCallbackUrl);                
    },
    function (session, results) {
        if (results.response) {
            session.userData.access_token = results.response;
            // do first call i.e. refreshAccounts
            api.refreshAccounts(session, function () {
                if(session.userData.authorised) 
                    session.replaceDialog('rootMenu');
                else 
                    session.replaceDialog('authoriseDialog');
            });            
        }
        else{
            session.replaceDialog('rootMenu');
        }         
    }    
])
.reloadAction('showMenu', null, { matches: /^(menu|help|\?)/i });

bot.dialog('selectAccountMenu', [
    function (session) {
        api.refreshAccounts(session, function () {
            if(session.userData.authorised) 
            {
                api.refreshCards(session, function (){});                                
                builder.Prompts.choice(session, "Select your account", getAccountsPromt(session));        
            }                
            else 
            {
                session.replaceDialog('authoriseDialog');
            }                
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
                session.send(session.userData.csasResponse.accounts[session.userData.acountIndex].balance.value + " " + session.userData.csasResponse.accounts[session.userData.acountIndex].balance.currency);
                session.replaceDialog('accountDialog');
                break;
            case 1:                
                api.accountHistory(session, function () {
                    if(session.userData.authorised) 
                    {
                        var history = '';
                        session.userData.accountHistory.transactions.forEach(function(transaction) {                        
                             history += ui.transactionDetail(transaction);
                        }, this);                
                        session.send(history);         
                        session.replaceDialog('accountDialog');               
                    }                        
                    else 
                    {
                        session.replaceDialog('authoriseDialog');
                    }    
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
      matches: /(^cancel)/i,
      confirmPrompt: "Are you sure?"
});


bot.dialog('selectCardMenu', [
    function (session) {
        api.refreshCards(session, function () {
            if(session.userData.authorised) 
            {
                api.refreshAccounts(session, function (){});                                
                builder.Prompts.choice(session, "Select your card", getCardsPromt(session));        
            }                
            else
            {
                session.replaceDialog('authoriseDialog');
            }                 
        });                             
    },
    function (session, results) {
        session.userData.cardIndex = results.response.index;        
        session.replaceDialog('cardsDialog');
    },
    function (session) {
        // Reload menu
        session.replaceDialog('selectCardsMenu');
    }
])
.reloadAction('showMenu', null, { matches: /^(menu|help|\?)/i })
.triggerAction({ matches: /^(cards|\?)/i });;



bot.dialog('cardsDialog', [
    function (session) {
        builder.Prompts.choice(session, "What do you want to do? Type 'cards' to return to cards selection or 'home'", "Show balance|Show detail");
    },
    function (session, results) {
        switch (results.response.index) {
            case 0:
                var cardBalance = ui.cardBalance(session.userData.cards.cards[session.userData.cardIndex]);
                
                session.send(cardBalance);
                session.replaceDialog('cardsDialog');
                break;
            case 1:                
                api.cardDetail(session, function () {
                    if(session.userData.authorised) 
                    {
                        session.send(session.userData.cardDetail);         
                        session.replaceDialog('cardsDialog');               
                    }                        
                    else 
                    {
                        session.replaceDialog('authoriseDialog');
                    }    
                });            
                
                break;            
            default:
                session.replaceDialog('cardsDialog');
                break;
        }
        
    },
    function (session) {
        // Reload menu
        session.replaceDialog('cardsDialog');
    }
])
.reloadAction('showMenu', null, { matches: /^(menu|help|\?)/i })
.cancelAction('cancelAction', "Canceled.", { 
      matches: /(^cancel)/i,
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
        cardsPrompt.push(card.owner + '/' + card.number + " - " + card.state );
    }, this);
    return cardsPrompt;
}