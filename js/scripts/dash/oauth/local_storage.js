namespace('Dash.OAuth');

(function() {
  'use strict';

  Dash.OAuth.LocalStorage = {
    names: {
      redirect: 'DashOAuthRedirect',
      state:    'DashOAuthState',
      token:    'DashOAuthToken'
    },

    set: function (key, value, options) {
      var expiresIn = options.expires * 60;
      store.set(key, {
        value: value,
        expiresIn: expiresIn,
        createdAt: new Date().getTime()
      })
    },

    get: function(key) {
      var info = store.get(key)
      if (!info) {
        return undefined;
      }
      if (new Date().getTime() - info.createdAt > info.expiresIn) {
        this.expire(key);
        return undefined;
      }
      return info.value
    },

    expire: function(key) {
      return store.remove(key);
    }
  };

}());
