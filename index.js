var CONFIG = require('./config');
var commands = require('./commands');
var express = require('express');
var http = require('http');
var irclib = require('irc');


var irc = new irclib.Client(CONFIG.host, CONFIG.user, {
    channels: Object.keys(CONFIG.channels),
    floodProtection: true,
});


function publicMessage (sender, channel, text, evt) {

    // Only deal with messages directly addressed to the bot.
    var prefix = CONFIG.user + ':';
    if (text.indexOf(prefix) === 0) {

        var bits = text.substring(prefix.length).trim().split(' ');
        var cmd_name = bits[0];
        var args = bits.slice(1);

        // Run a command, if recognized.
        if(cmd_name in commands) {
            commands[cmd_name].fn(irc, args, channel, text, evt);
        } else {
            irc.say(channel, "What's a '" + cmd_name + "'?");
        }

    }
}


// HALP.
var privateMessage = function(sender, recipient, text, evt) {
    var msg = '';
    var cmd_list = Object.keys(commands).join(', ');

    // List all available commands.
    if (text.trim() === 'help') {
        msg += "The following commands are available: " + cmd_list;
        msg += "\nType `help <command>` to learn about a particular command.";

    // Show help for a specific command.
    } else if (text.indexOf('help ') === 0) {
        var args = text.split(' ');
        var command = commands[args[1]];
        if (command) {
            msg = command.description + "\nUsage: " + command.usage;
        } else {
            msg = "What's a '" + args[1] + "'?";
        }
   
    // Iono.     
    } else {
        msg = "Type `help` to learn what I am capable of.";
    }

    irc.say(sender, msg);
}


// IDENTIFY on connection.
irc.addListener('registered', function(message) {
    var password = process.env.IDENTIFYCATION;
    if (password) {
        irc.say('NickServ', 'IDENTIFY ' + password)
    }
});


// Respond to messages appropriately.
irc.addListener('message', function(sender, receipient, text, evt) {
    var is_public = receipient.indexOf('#') === 0;
    var receive = is_public ? publicMessage : privateMessage;
    receive(sender, receipient, text, evt);
});


var app = express();
app.use(express.json());
app.use(express.urlencoded());


// No 404.
app.get('/', function(req, res){
    res.status(200).set({'Content-Type': 'text/plain'}).send('');
});


// Accept GitHub webhooks for new pull requests. 
app.post('/payload', function(req, res){
    var b = req.body;
    
    // Only process new pull requests.
    if (b.action === 'opened') {
        var pr = b.pull_request;
        var repo = pr.base.repo.owner.login + '/' + pr.base.repo.name;
        var msg = "[" + repo + "] " + pr.user.login + " has opened pull request #" + pr.number + ": " + pr.title;
        msg += "\n" + pr.html_url

        // If a user is mentioned in the PR body, mention them in the
        // notification.
        if (pr.body) {
            var mentions = pr.body.match(/@([A-Za-z0-9_-]+)/g);
            var matches = [];
            for (idx in mentions) {
                var mention = mentions[idx];
                if (mention in CONFIG.users) {
                    matches.push(CONFIG.users[mention]);
                }
            }
            if (matches.length) {
                msg += "\n" + matches.join(', ') + ': could you give it a review?'
            }
        }

        // Post notifications to IRC channels.
        for (channel_name in CONFIG.channels) {
            if (CONFIG.channels[channel_name].indexOf(repo) > -1) {
                irc.say(channel_name, msg);
            }
        }

    }
    res.status(200).send('');
});

app.listen(CONFIG.port);
