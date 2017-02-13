require('dotenv-extended').load();
var restify = require('restify');
var builder = require('botbuilder');

var bot = require('./bot');

// Create chat bot
var connector = new builder.ConsoleConnector();

bot.create(connector);
connector.listen();
