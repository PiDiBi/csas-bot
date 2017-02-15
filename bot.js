var builder = require('botbuilder');
var api = require('./api');
var ui = require('./ui');

var CSAS_API_KEY = process.env.CSAS_API_KEY;
var PORT = process.env.port || process.env.PORT || 3978;
var HOSTNAME = process.env.WEBSITE_HOSTNAME ? ("https://" + process.env.WEBSITE_HOSTNAME) : ("http://localhost" + ":" + PORT);

// use demo user : 7777777777 / any password
var authCallbackUrlCode = 'https://api.csas.cz/sandbox/widp/oauth2/auth?redirect_uri='+HOSTNAME+'/authCallbackServer&client_id=WebExpoClient&response_type=code';
var authCodeUrl = 'https://api.csas.cz/sandbox/widp/oauth2/auth';

var telemetryModule = require('./telemetry-module.js');

var appInsights = require('applicationinsights');
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY).start();
var appInsightsClient = appInsights.getClient();

function create(connector) {
    
    //=========================================================
    // Bot Setup
    //=========================================================

    var bot = new builder.UniversalBot(connector, [    
        function (session) {  
            //for webchat                    
            if(session.userData.access_token == ""){
                session.replaceDialog('authorizeDialog', 'rootMenu');
            }  
            else{
                // this causes to be ther menu second time, but first it somehow lost
                 session.replaceDialog('rootMenu');
            }
            var telemetry = telemetryModule.createTelemetry(session, { where: '' });
            appInsightsClient.trackTrace('start', telemetry);
            
        }
    ]);

    bot.on('contactRelationUpdate', function (message) {
        // for webchat
        // if (message.action === 'add') {            
        //     sendGreetings(message, bot);
        // } else {
        //     // delete their data
        // }
    });
    bot.on('conversationUpdate', function (message) {
        // for skype and emulator
        if (message.membersAdded) {            
            sendGreetings(message, bot);
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
            sendSignInCard(session);
            var telemetry = telemetryModule.createTelemetry(session);
            appInsightsClient.trackEvent('authorizeDialog', telemetry);
               
        }
    ])
    .reloadAction('showMenu', null, { matches: /^(menu|help|\?)/i });

    bot.dialog('selectAccountMenu', [
        function (session) {
            var telemetry = telemetryModule.createTelemetry(session);
            appInsightsClient.trackEvent('accounts selected', telemetry);

            api.refreshAccounts(session)
                .then(function(result){
                        builder.Prompts.choice(session, "Select your account", getAccountsPromt(session));
                    }
                )        
                .catch(function(e){
                    console.log("Catch handler " + e);
                    var exceptionTelemetry = telemetryModule.createTelemetry(session);
                    exceptionTelemetry.exception = e.toString();
                    appInsightsClient.trackException(exceptionTelemetry);
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
            var telemetry = telemetryModule.createTelemetry(session);
            appInsightsClient.trackEvent('account selected', telemetry);
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
                            var exceptionTelemetry = telemetryModule.createTelemetry(session);
                            exceptionTelemetry.exception = e.toString();
                            appInsightsClient.trackException(exceptionTelemetry);
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
            var telemetry = telemetryModule.createTelemetry(session);
            appInsightsClient.trackEvent('cards selected', telemetry);
            api.refreshCards(session)
            .then(function(result){
                    builder.Prompts.choice(session, "Select your card to show more info", getCardsPromt(session));    
                }
            )        
            .catch(function(e){
                console.log("Catch handler " + e);
                var exceptionTelemetry = telemetryModule.createTelemetry(session);
                exceptionTelemetry.exception = e.toString();
                appInsightsClient.trackException(exceptionTelemetry);
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


function sendGreetings(message, bot)
{
    var name = message.user ? message.user.name : null;
    message.membersAdded.forEach(function (identity) {
        if (identity.id === message.address.bot.id) {            
            var session = bot.loadSession(message.address, function(error, session){
                var telemetry = telemetryModule.createTelemetry(session, { where: 'conversationUpdate' });
                appInsightsClient.trackTrace('start', telemetry);    
                session.send("Hello %s...  I'm a CSAS bank bot ...", name || 'there');
                session.userData.nextDialog = "rootMenu";
                sendSignInCard(session);
            }); 

        }
    });
}
function sendSignInCard(session){
    var b = new Buffer(JSON.stringify(session.message.address));            
    var card = createSigninCard(session, authCallbackUrlCode + "&state=" + b.toString('base64'));
    // attach the card to the reply message
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
}

function createSigninCard(session, url) {
    return new builder.SigninCard(session)
        .text('CSAS Sandbox, please sign-in first')
        .button('Sign-in', url);
}