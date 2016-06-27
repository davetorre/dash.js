namespace('Dash.OAuth');

(function() {
  'use strict';

  var buildAccessor = function (Storage) {

    return {
      set: function(appId, token, expiresInSeconds) {
        expiresInSeconds = parseInt(expiresInSeconds);
        Storage.set(this.key(appId), token, {expires: expiresInSeconds});
        if (expiresInSeconds !== null) {
          Storage.set(this.expiresInKey(appId), this._futureUnixTime(expiresInSeconds), {expires: expiresInSeconds});
        } else {
          this.expireExpiresIn(appId);
        }
      },

      get: function(appId) {
        return Storage.get(this.key(appId));
      },

      _futureUnixTime: function(futureOffsetInSeconds) {
        var offsetInMilliseconds = parseInt(futureOffsetInSeconds) * 1000;
        return (new Date(Date.now() + offsetInMilliseconds)).valueOf();
      },

      getExpiresIn: function(appId) {
        var unixTimeExpiration = parseInt(Storage.get(this.expiresInKey(appId)));
        if (isNaN(unixTimeExpiration)) {
          return Infinity;
        } else {
          return (unixTimeExpiration - Date.now()) / 1000;
        }
      },

      expire: function(appId) {
        Storage.expire(this.key(appId));
        this.expireExpiresIn(appId);
      },

      expireExpiresIn: function(appId) {
        Storage.expire(this.expiresInKey(appId));
      },

      prefix: "smi-access-token:",
      expiresInPrefix: "smi-access-token-expiration:",

      key: function(appId) {
        return "" + this.prefix + appId;
      },

      expiresInKey: function(appId) {
        return "" + this.expiresInPrefix + appId;
      },

      expireAll: function(appIds) {
        var _this = this;
        $.each(appIds, function(i, id) {
          _this.expire(id);
        });
      }
    };
  };

  Dash.OAuth.TokenAccessor = buildAccessor(Dash.OAuth.Cookie);

  Dash.OAuth.LocalStorageTokenAccessor = buildAccessor(Dash.OAuth.LocalStorage);

}());
