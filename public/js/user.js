// A simple modal to edit the permalink join. Since we don't currently have any fields
// other than the join, we borrow the logic from the images widget editor to skip
// actual display of the modal, but still benefit from the existing functionality to
// populate and convert joins. -Tom

apos.define('apostrophe-rich-text-enhancements-permalink-editor', {

  source: 'permalink-editor',

  construct: function(self, options) {
    self.schema = [ options.permalink.join ];

    var superBeforeShow = self.beforeShow;
    self.beforeShow = function(callback) {
      self.$form = self.$el.find('[data-apos-form]');
      self.$el.css('opacity', 0);
      self.chooser = self.$el.find('[data-chooser]:first').data('aposChooser');
      return apos.schemas.populate(self.$form, self.schema, {}, callback);
    };

    var superAfterShow = self.afterShow;
    self.afterShow = function() {
      superAfterShow();
      var superAfterManagerSave = self.chooser.afterManagerSave;
      self.chooser.afterManagerSave = function() {
        superAfterManagerSave();
        self.save();
      };
      var superAfterManagerCancel = self.chooser.afterManagerCancel;
      self.chooser.afterManagerCancel = function() {
        superAfterManagerCancel();
        self.$el.css('opacity', 1);
        self.cancel();
      };
    };

    self.saveContent = function(callback) {
      var output = {};
      return apos.schemas.convert(self.$form, self.schema, output, function(err) {
        if (err) {
          return callback(err);
        }
        self.result = output;
        return callback(null);
      });
    };

    self.afterHide = function() {
      if (!self.result) {
        return options.callback('canceled');
      }
      return options.callback(null, self.result);
    };

  }
});

apos.define('apostrophe-rich-text-enhancements', {
  construct: function(self, options) {
    console.log('instantiating');

    CKEDITOR.plugins.addExternal('permalink', '/modules/apostrophe-rich-text-enhancements/js/ckeditorPlugins/permalink/', 'plugin.js');
    console.log('after addExternal');

    self.choosePermalink = function(callback) {
      return apos.create('apostrophe-rich-text-enhancements-permalink-editor', _.assign({
        callback: callback
      }, options));
    };
  }
});


