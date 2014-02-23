var CONFIG = require('./config');
var github = require('./gh');

var commands = {

    'celebrate': {
        'description': "Celebrate with the ewoks.",
        'fn': function(irc, args, channel, text, evt) {
            var msg = "Yub nub, eee chop yub nub / Ah toe meet toe peechee keene, / Gnoop dock fling oh ah.";
            irc.say(channel, msg);
        },
        'usage': "`ewok: celebrate`"
    },

    'pulls': {
        'description': "View pull requests related to a channel",
        'fn': function(irc, args, channel, text, evt) {
            if (args.length) {
                var repos = args
            } else if (channel in CONFIG.channels && CONFIG.channels[channel].length) {
                var repos = CONFIG.channels[channel]
            } else {
                irc.say(channel, 'No repositories configured for this channel.');
            }
            for (repo in repos) {
                github.prs_for(repos[repo], irc, channel);
            }
        },
        'usage': "`ewok: pulls` to view pull requests for all that channel's repos, or `ewok: <user/repo>` to view pull requests for an individual repo."
    }

};

module.exports = commands;
