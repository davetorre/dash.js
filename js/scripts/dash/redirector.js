namespace('Dash');

(function () {
  'use strict';

  var buildRedirector = function (TokenAccessor, Browser) {
    return function (redirectUrl) {
      this.redirectUrl = redirectUrl;

      this.register = function() {
        TokenAccessor.set('redirect-url', this.redirectUrl);
      };

      this.redirect = function() {
        var url = this.savedRedirectUrl();
        if (url !== undefined) {
          Browser.changeHref(url);
          this.clearUrl();
        }
      };

      this.savedRedirectUrl = function() {
        return TokenAccessor.get('redirect-url');
      };

      this.clearUrl = function() {
        TokenAccessor.expire('redirect-url');
      };
    };
  };

  Dash.Redirector = buildRedirector(Dash.OAuth.TokenAccessor, Dash.Browser.Location);

  Dash.LocalStorageRedirector = buildRedirector(Dash.OAuth.LocalStorageTokenAccessor, Dash.Browser.Location);

}());

