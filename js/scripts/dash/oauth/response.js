namespace('Dash.OAuth');

(function() {
  'use strict';

  var buildResponse = function(TokenValidator) {
    return function(locationHash) {
      this.normalizedLocationHash = function(locationHash) {
        var parts;
        parts = locationHash.split('#');
        if (parts.length === 2) {
          return "?" + parts[1];
        } else if (parts.length === 3) {
          return "?" + parts[2];
        }
      };

      this.params = new Dash.OAuth.Params(this.normalizedLocationHash(locationHash));

      this.token = function() {
        return this.params.get('access_token');
      };

      this.context = function() {
        return this.params.get('context');
      };

      this.expiresIn = function() {
        return this.params.get('expires_in');
      };

      this.isValidState = function() {
        var expiresIn, state, tokenValidator;
        state = this.params.get('state');
        expiresIn = this.params.get('expires_in');
        tokenValidator = new TokenValidator(state, this.token(), expiresIn);
        return tokenValidator.isValidState();
      };
    };
  };

  Dash.OAuth.Response = buildResponse(Dash.OAuth.TokenValidator);

  Dash.OAuth.LocalStorageResponse = buildResponse(Dash.OAuth.LocalStorageTokenValidator);

}());
