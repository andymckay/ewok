module.exports = {
    'host': 'irc.mozilla.org',
    'port': process.env.VCAP_APP_PORT || 6006,
    'user': 'ewok',


    // In which channels should the bot hang out? Which repositories should be
    // monitored for pull requests?
    //
    // NB: https://ewok.paas.allizom.org/payload should be added as a pull
    // webhook in the repository.
    //
    // Format:
    // '#channel': ['user/repo', 'user/repo']

    'channels': {
        '#amo': [],
        '#marketplace': [],
        '#payments': [
            'mozilla/solitude', 'mozilla/webpay', 'mozilla/spartacus',
            'mozilla/curling', 'mozilla/zippy'
        ],
        '#marketplace-api': [
            'mozilla/zamboni'
        ],
        '#fireplace': [
            'mozilla/fireplace'
        ]
    },


    // Opt in to getting mentions in IRC when your GitHub username is referenced
    // in the body of a pull request (e.g. in an ask for review).
    //
    // Format:
    // '@github_username': 'irc_handle'

    'users': {
        '@chuckharmston': 'chuck'
    }

};
