var modules = [
  'apostrophe-rich-text-permalinks-rich-text-widgets'
];

var _ = require('lodash');

module.exports = {
  moogBundle: {
    modules: modules,
    directory: 'lib/modules'
  },
  afterConstruct: function(self) {
    self.pushCreateSingleton();
  },
  construct: function(self, options) {
    if (!self.options.join) {
      self.options.join = {};
    }
    _.defaults(self.options.join, {
      label: 'Page',
      withType: 'apostrophe-page'
    });
    _.assign(self.options.join, {
      name: '_doc',
      type: 'joinByOne',
      idField: 'docId'
    });
    self.route('post', 'permalink-editor', function(req, res) {
      var schema = [
        self.options.join
      ];
      self.apos.schemas.bless(req, schema);
      return res.send(self.render(req, 'permalinkEditor', {
        schema: schema
      }));
    });

    self.pushAsset('script', 'user', { when: 'user' });
    var superGetCreateSingletonOptions = self.getCreateSingletonOptions;
    self.getCreateSingletonOptions = function() {
      var options = superGetCreateSingletonOptions();
      options.join = self.options.join;
      options.browseLabel = self.options.browseLabel;
      options.typeLabel = self.options.typeLabel;
      var singular;
      if (options.typeLabel) {
        if (!options.browseLabel) {
          options.browseLabel = 'Browse ' + options.typeLabel;
        }
      }
      if (!options.typeLabel) {
        if (Array.isArray(options.join.withType) && (options.join.withType.length === 1)) {
          singular = options.join.withType[0];
        } else if ((typeof options.join.withType) === 'string') {
          singular = options.join.withType;
        }
        if (singular) {
          var manager = self.apos.docs.getManager(options.join.withType);
          if (manager && manager.pluralLabel) {
            options.typeLabel = manager.pluralLabel;
            options.browseLabel = 'Browse ' + manager.pluralLabel;
          }
        }
        if (!options.browseLabel) {
          if (singular === 'apostrophe-page') {
            options.typeLabel = 'Pages';
            options.browseLabel = 'Browse Pages';
          }
        }
        if (!options.typeLabel) {
          options.typeLabel = 'Documents';
          options.browseLabel = 'Browse Documents';
        }
      }
      return options;
    };

    // Used to get the title and _url of a permalinked doc after insertion
    self.route('post', 'info', function(req, res) {
      var _id = self.apos.launder.id(req.body._id);
      if (!_id) {
        return res.send({ status: 'invalid' });
      }
      return self.apos.docs.find(req, { _id: _id }).toObject(function(err, doc) {
        if (err) {
          return res.send({ status: 'error' });
        }
        if (!doc) {
          return res.send({ status: 'notfound' });
        }
        return res.send({ status: 'ok', doc: _.pick(doc, '_id', 'title', '_url') });
      });
    });
  }
};
