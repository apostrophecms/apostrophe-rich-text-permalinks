module.exports = {
  construct: function(self, options) {
    self.pushAsset('script', 'user', { when: 'user' });
    self.pushCreateSingleton();
    var superGetCreateSingletonOptions = self.getCreateSingletonOptions;
    self.getCreateSingletonOptions = function() {
      var options = superGetCreateSingletonOptions();
      options.permalink = self.options.permalink;
      return options;
    };
  }
};
