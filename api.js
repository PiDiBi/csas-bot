var request = require('request');
var ui = require('./ui');
var CSAS_API_KEY = process.env.CSAS_API_KEY;
// api calls
module.exports = {
  
  refreshAccounts: function(session, callback)
    {
        request({
            method: 'GET',
            url: 'https://api.csas.cz/sandbox/webapi/api/v3/netbanking/my/accounts?size=&page=&sort=&order=&type=',
            headers: {
                'WEB-API-key': CSAS_API_KEY,
                'Authorization': session.userData.access_token
            }}, function (error, response, body) {
                if(response.statusCode==403)
                {
                    session.userData.authorised = false;
                    callback();
                    return;
                }                 
                session.userData.accounts = JSON.parse(body);                                
                session.userData.authorised = true;
                callback();
            });                                                
    },
    accountHistory: function(session, callback)
    {
        request({
            method: 'GET',
            url: 'https://api.csas.cz/sandbox/webapi/api/v1/netbanking/my/accounts/id/transactions?dateStart=2014-06-01T00%3A00%3A00%2B02%3A00&dateEnd=2014-06-30T00%3A00%3A00%2B02%3A00',
            headers: {
                'WEB-API-key': CSAS_API_KEY,
                'Authorization': session.userData.access_token
            }}, function (error, response, body) {
                if(response.statusCode == 403)
                {
                    session.userData.authorised = false;
                    callback();
                    return;
                }
                var history = JSON.parse(body); 
                session.userData.accountHistory = JSON.parse(body);
                
                session.userData.authorised = true;
                callback();
                //session.send(histText);         
                //session.replaceDialog('accountDialog');               
        });
                          
    },
    refreshCards: function(session, callback)
    {
        request({
            method: 'GET',
            url: 'https://api.csas.cz/sandbox/webapi/api/v3/netbanking/my/cards?size=&page=&sort=&order=',
            headers: {
                'WEB-API-key': CSAS_API_KEY,
                'Authorization': session.userData.access_token
            }}, function (error, response, body) {
                if(response.statusCode==403)
                {
                    session.userData.authorised = false;
                    callback();
                    return;
                }                 
                var objCards = JSON.parse(body);                                
                session.userData.cards = objCards;           
                session.userData.authorised = true;
                callback();
            });                                                
    },
    cardDetail: function(session, callback)
    {
        request({
            method: 'GET',
            url: 'https://api.csas.cz/sandbox/webapi/api/v3/netbanking/my/cards/' + session.userData.cards.cards[session.userData.cardIndex].id,
            headers: {
                'WEB-API-key': CSAS_API_KEY,
                'Authorization': session.userData.access_token
            }}, function (error, response, body) {
                if(response.statusCode == 403)
                {
                    session.userData.authorised = false;
                    callback();
                    return;
                }
                var card = JSON.parse(body);                                        
                session.userData.cardDetail = "";
                session.userData.cardDetail += 'Owner: ' + card.owner + '\n\r';
                session.userData.cardDetail += 'Number: ' + card.number + '\n\r';
                session.userData.cardDetail += 'Expire: ' + card.expiryDate + '\n\r';
                session.userData.cardDetail += 'Type: ' + card.productI18N + '\n\r';
                session.userData.cardDetail += 'Credit Card: ' + card.creditCard + '\n\r';

                session.userData.authorised = true;
                callback();
                //session.send(histText);         
                //session.replaceDialog('accountDialog');               
        });
                          
    }



};

