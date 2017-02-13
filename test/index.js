var builder = require('botbuilder');
var common = require('./common');
var assert = require('assert');

var apiMock = require('./api-mock');
var testBot = require('../bot');
var homeMessages = require('./dialog-flows/home');
var helpMessages = require('./dialog-flows/help');
//var setAlarmMessages = require('./dialog-flows/set-alarm');
//var setAlarmMessages2 = require('./dialog-flows/set-alarm2');

apiMock.setup();

console.log ('--------  -------- ---- START ---- -------- --------');
//Our parent block
describe('Bot Tests', () => {    
    
    it('home', function (done) { 
        //this.timeout(15000);
        var connector = new builder.ConsoleConnector();
        var bot = testBot.create(connector);
        common.testBot(bot, homeMessages, done);
    });

//   it('help', function (done) { 
//       //this.timeout(15000);
//       var connector = new builder.ConsoleConnector();
//       var bot = testBot.create(connector);
//       common.testBot(bot, helpMessages, done);
//   });

//   it('create alarm', function (done) { 
//       var connector = new builder.ConsoleConnector();

//       var bot = testBot.create(connector);       
//       common.testBot(bot, setAlarmMessages, done);
//   });

//   it('create alarm test func', function (done) {
//       // Increasing timeout to enable alarms to show
//       this.timeout(20000);

//       var connector = new builder.ConsoleConnector();

//       var bot = testBot.create(connector);       
//       common.testBot(bot, setAlarmMessages2, done);
//   });
});