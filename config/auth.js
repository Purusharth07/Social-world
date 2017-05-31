// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '218298505243688', // your App ID
        'clientSecret'  : '22d86aa4b8be203674c1b19c713de00f', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    }

};