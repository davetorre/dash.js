namespace('Dash.OAuth');

(function() {
  'use strict';

  var buildAccessRequester = function(Storage, Browser) {
    return function(urlGenerator) {
      var FIVE_MINUTES_IN_SECONDS = 300;
      this.urlGenerator = urlGenerator;

      this.requestAccess = function() {
        var urlAndState = this.urlGenerator.generate();
        this.storeState(urlAndState.state);
        this.sendRequest(urlAndState.url);
      };

      this.storeState = function (state) {
        Storage.set(Storage.names.state, state, {expires: FIVE_MINUTES_IN_SECONDS});
      };

      this.sendRequest = function(url) {
        Browser.Location.change(url);
      };
    };
  };

  Dash.OAuth.AccessRequester = buildAccessRequester(Dash.OAuth.Cookie, Dash.Browser);

  Dash.OAuth.LocalStorageAccessRequester = buildAccessRequester(Dash.OAuth.LocalStorage, Dash.Browser);

}());
