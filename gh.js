var GitHub = require('github');
var github = new GitHub({
    version: '3.0.0',
    debug: true,
    protocol: 'https'
});

function prs_for(repo, irc, respond_to) {
    var bits = repo.split('/');
    var user = bits[0];
    var repo = bits[1];
    github.pullRequests.getAll({
        'user': user,
        'repo': repo,
        'state': 'open'
    }, function(err, res){
        var msg = repo + " has " + res.length + " open pull requests" + (res.length ? ':' : '.');
        for (pr in res){
            var pr = res[pr];
            if (pr.number) {
                msg = msg + "\n - #" + pr.number + " " + pr.title + " - " + pr.html_url;
            }
        }
        irc.say(respond_to, msg);
    });
}

module.exports = {
    'github': github,
    'prs_for': prs_for
}
