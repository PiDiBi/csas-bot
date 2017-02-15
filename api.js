var request = require('request');
var Promise = require('bluebird');
var querystring = require('querystring');

var CSAS_API_KEY = process.env.CSAS_API_KEY;
var PORT = process.env.port || process.env.PORT || 3978;
var HOSTNAME = process.env.WEBSITE_HOSTNAME ? ("https://" + process.env.WEBSITE_HOSTNAME) : ("http://localhost" + ":" + PORT);

var appInsights = require('applicationinsights');
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY).start();
var appInsightsClient = appInsights.getClient();

// api calls
module.exports = {
  
  refreshAccounts: function(session)
    {
        if (!session) return Promise.reject(new Error("Bad parameter"))
    
        return new Promise(function(resolve, reject){            
            request({
                method: 'GET',
                url: 'https://api.csas.cz/sandbox/webapi/api/v3/netbanking/my/accounts?size=&page=&sort=&order=&type=',
                headers: {
                    'WEB-API-key': CSAS_API_KEY,
                    'Authorization': session.userData.access_token
                }}, function (error, response, body) {
                    if(error)
                    {                        
                        appInsightsClient.trackException(error);         
                        reject(error);
                    }
                    else if(response.statusCode==403)
                    {
                        session.userData.accounts = {};
                        reject(new Error('unauthorized'))
                    }
                    else
                    {
                        session.userData.accounts = JSON.parse(body);                    
                        resolve();
                    }                    
                });
        });
                                                        
    },
    accountHistory: function(session)
    {
        if (!session) return Promise.reject(new Error("Bad parameter"))
		
		return new Promise(function(resolve, reject){            
            request({
                method: 'GET',
                url: 'https://api.csas.cz/sandbox/webapi/api/v1/netbanking/my/accounts/id/transactions?dateStart=2014-06-01T00%3A00%3A00%2B02%3A00&dateEnd=2014-06-30T00%3A00%3A00%2B02%3A00',
                headers: {
                    'WEB-API-key': CSAS_API_KEY,
                    'Authorization': session.userData.access_token
                }}, function (error, response, body) {
                    if(error)
                    {
                        appInsightsClient.trackException(error);         
                        reject(error);
                    }
                    else if(response.statusCode == 403)
                    {                    
                        reject(new Error('unauthorized'));                        
                    }
                    else
                    {
                        var history = JSON.parse(body); 
                        session.userData.accountHistory = JSON.parse(body);                                
                        resolve();
                    }                    
            });
		});
        
                          
    },
    refreshCards: function(session)
    {
        if (!session) return Promise.reject(new Error("Bad parameter"))
		
		return new Promise(function(resolve, reject){            
		    request({
                method: 'GET',
                url: 'https://api.csas.cz/sandbox/webapi/api/v3/netbanking/my/cards?size=&page=&sort=&order=',
                headers: {
                    'WEB-API-key': CSAS_API_KEY,
                    'Authorization': session.userData.access_token
                }}, function (error, response, body) {
                    if(error)
                    {
                        appInsightsClient.trackException(error);         
                        reject(error);
                    }
                    else if(response.statusCode==403)
                    {                    
                        reject(new Error('unauthorized'));                        
                    }                
                    else{
                        var objCards = JSON.parse(body);                                
                        session.userData.cards = objCards;                           
                        resolve();
                    }                    
                });      
		});

                                                      
    },
    cardDetail: function(session)
    {
        if (!session) return Promise.reject(new Error("Bad parameter"))
		
		return new Promise(function(resolve, reject){            
            request({
                method: 'GET',
                url: 'https://api.csas.cz/sandbox/webapi/api/v3/netbanking/my/cards/' + session.userData.cards.cards[session.userData.cardIndex].id,
                headers: {
                    'WEB-API-key': CSAS_API_KEY,
                    'Authorization': session.userData.access_token
                }}, function (error, response, body) {
                    if(error)
                    {
                        appInsightsClient.trackException(error);         
                        reject(error);
                    }
                    else if(response.statusCode == 403)
                    {                    
                        reject(new Error('unauthorized'));
                        return;
                    }
                    else if(response.statusCode == 404)
                    {
                        console.log('API call, card not found: '+ session.userData.cards.cards[session.userData.cardIndex].id);  
                        //reject(new Error('API call, card not found'));
                        resolve("API call, card not found");
                    }
                    else
                    {
                        var card = JSON.parse(body);                                        
                        session.userData.card = card;                                
                        resolve();
                    }
                    
            });		
		});

                          
    },
    buildingSavings:  function(session)
    {
        if (!session) return Promise.reject(new Error("Bad parameter"))
		
		return new Promise(function(resolve, reject){            
		
		});
        //https://api.csas.cz/sandbox/webapi/api/v3/netbanking/my/contracts/buildings
    },

    oauthCodeExchangeForAuth:  function(code)
    {
        var form = {
            'client_id': 'WebExpoClient',
                        'client_secret': '201509201300',
                        'grant_type': 'authorization_code',
                        'code': code,
                        'redirect_uri': HOSTNAME+'/authCode',                    
        };

		var formData = querystring.stringify(form);
        var contentLength = formData.length;
        
		return new Promise(function(resolve, reject){            
            request({
                method: 'POST',
                url: 'https://api.csas.cz/sandbox/widp/oauth2/token',
                body: formData,
                headers: {                     
                    'Accept': 'application/json',
                    'Accept-Language': 'en-us',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': contentLength
                }}, function (error, response, body) {
                    if(response.statusCode==403)
                    {                    
                        reject(new Error('unauthorized'));                        
                    }                
                    else{                       
                        resolve(body);
                    }                    
                });      
		});        
    }

};

