apos.define('apostrophe-rich-text-widgets-editor', {
  construct: function(self, options) {
    var superBeforeCkeditorInline = self.beforeCkeditorInline;
    self.beforeCkeditorInline = function() {
      superBeforeCkeditorInline();
      self.config.extraPlugins = (self.config.extraPlugins || '').split(',').concat([ 'permalink' ]).join(',');
    };
  }
});
