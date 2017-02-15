var builder = require('botbuilder');
var api = require('./api');
var ui = require('./ui');

var CSAS_API_KEY = process.env.CSAS_API_KEY;
var PORT = process.env.port || process.env.PORT || 3978;
var HOSTNAME = process.env.WEBSITE_HOSTNAME ? ("https://" + process.env.WEBSITE_HOSTNAME) : ("http://localhost" + ":" + PORT);

// use demo user : 7777777777 / any password
var authCallbackUrlCode = 'https://api.csas.cz/sandbox/widp/oauth2/auth?redirect_uri='+HOSTNAME+'/authCallbackServer&client_id=WebExpoClient&response_type=code';
var authCodeUrl = 'https://api.csas.cz/sandbox/widp/oauth2/auth';

function create(connector) {
    
    //=========================================================
    // Bot Setup
    //=========================================================

    var bot = new builder.UniversalBot(connector, [    
        function (session) {                        
            session.beginDialog('authorizeDialog', 'rootMenu');
        }
    ]);

    bot.on('contactRelationUpdate', function (message) {
        if (message.action === 'add') {
            var name = message.user ? message.user.name : null;
            var reply = new builder.Message()
                    .address(message.address)
                    .text("Hello %s...  I'm a CSAS bank bot.", name || 'there');
            bot.send(reply);
            bot.beginDialog(message.address, "authorizeDialog", 'rootMenu')
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
                    bot.beginDialog(message.address, "authorizeDialog", "rootMenu")
                }
            });
        }
    });
          
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
    .triggerAction({ matches: /^(home)/i });;

    bot.dialog('authorizeDialog', [
        function (session, nextDialog) { //, next)
            session.dialogData.nextDialog = nextDialog; 
            session.userData.accountsPrompt = [];
            session.userData.access_token = "";
            session.userData.accounts = {};
            session.userData.nextDialog = nextDialog;
            var b = new Buffer(JSON.stringify(session.message.address));            
            var card = createSigninCard(session, authCallbackUrlCode + "&state=" + b.toString('base64'));
            // attach the card to the reply message
            var msg = new builder.Message(session).addAttachment(card);
            session.send(msg);
               
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
                            console.log("Catch handler " + e);
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

    return bot;
};

module.exports = { create };

// private functions

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

function createSigninCard(session, url) {
    return new builder.SigninCard(session)
        .text('CSAS Sandbox')
        .button('Sign-in', url);
}