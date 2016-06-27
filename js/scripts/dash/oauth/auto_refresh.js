namespace('Dash.OAuth');

(function() {
  'use strict';

  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  var buildAutoRefresh = function (TokenAccessor, Storage, AccessRequester) {
    function AutoRefresh(appId, urlGenerator, shouldShowCallback) {
      this.appId = appId;
      this.urlGenerator = urlGenerator;
      this.shouldShowCallback = shouldShowCallback;
      this.refreshLocation = __bind(this.refreshLocation, this);
    }

    AutoRefresh.prototype.modalDataId = 'refresh-modal';

    AutoRefresh.prototype.checkForTokenInterval = 200;
    AutoRefresh.prototype.maxWaitForToken = 6000;

    AutoRefresh.prototype.register = function() {
      var timeInSeconds, timeoutInMilliseconds,
        _this = this;
      timeInSeconds = TokenAccessor.getExpiresIn(this.appId);
      timeoutInMilliseconds = timeInSeconds * 1000;
      this.timeoutId = Dash.Browser.setTimeout((function() {
        return _this.trigger();
      }), timeoutInMilliseconds);

      return this.timeoutId;
    };

    AutoRefresh.prototype.trigger = function() {
      if (this.shouldShowModal()) {
        this.cleanUp();
        return this.renderModal();
      }
    };

    AutoRefresh.prototype.renderModal = function() {
      var _this = this;
      TokenAccessor.expire(this.appId);
      Storage.set('isAutoRefresh', 'true', 10);
      var urlAndState = this.urlGenerator.generate();
      (new AccessRequester()).storeState(urlAndState.state);
      this.modal = this.createModal(urlAndState.url);
      this.modal.render();
      this.refreshPageTimeoutId = Dash.Browser.setTimeout(function(){_this.refreshLocation(urlAndState.url);}, this.maxWaitForToken);
      this.intervalId = Dash.Browser.setInterval((function() {
        return _this.closeModal();
      }), this.checkForTokenInterval);

      return this.intervalId;
    };

    AutoRefresh.prototype.createModal = function(url) {
      return new Dash.OAuth.TokenRefreshIframe(url);
    };

    AutoRefresh.prototype.refreshLocation = function(url) {
      AutoRefresh.expireFlag();
      return Dash.Browser.Location.change(url);
    };

    AutoRefresh.prototype.closeModal = function() {
      if (TokenAccessor.get(this.appId) !== undefined) {
        this.cleanUp();
        return this.register();
      }
    };

    AutoRefresh.prototype.cleanUp = function() {
      var _ref;
      clearTimeout(this.timeoutId);
      clearTimeout(this.refreshPageTimeoutId);
      clearInterval(this.intervalId);
      return (_ref = this.modal) !== undefined ? _ref.remove() : void 0;
    };

    AutoRefresh.prototype.shouldShowModal = function() {
      if (this.shouldShowCallback !== undefined) {
        return this.shouldShowCallback();
      } else {
        return true;
      }
    };

    AutoRefresh.expireFlag = function() {
      return Storage.expire('isAutoRefresh');
    };

    AutoRefresh.isFlagSet = function() {
      return (Storage.get('isAutoRefresh') !== undefined);
    };

    return AutoRefresh;
  };

  Dash.OAuth.AutoRefresh = buildAutoRefresh(Dash.OAuth.TokenAccessor, Dash.OAuth.Cookie, Dash.OAuth.AccessRequester);

  Dash.OAuth.LocalStorageAutoRefresh = buildAutoRefresh(Dash.OAuth.LocalStorageTokenAccessor, Dash.OAuth.LocalStorage, Dash.OAuth.LocalStorageAccessRequester);

}).call(this);
