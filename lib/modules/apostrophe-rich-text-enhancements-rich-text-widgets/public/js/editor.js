apos.define('apostrophe-rich-text-widgets-editor', {
  construct: function(self, options) {
    var superBeforeCkeditorInline = self.beforeCkeditorInline;
    self.beforeCkeditorInline = function() {
      superBeforeCkeditorInline();
      console.log('configuring');
      self.config.extraPlugins = (self.config.extraPlugins || '').split(',').concat([ 'permalink' ]).join(',');
      console.log(self.config.extraPlugins);
    };
  }
});
