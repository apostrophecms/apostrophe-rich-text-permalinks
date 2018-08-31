var _ = require('lodash');

module.exports = {
  improve: 'apostrophe-rich-text-widgets',
  construct: function(self, options) {
    var superLoad = self.load;
    self.load = function(req, widgets, callback) {
      return superLoad(req, widgets, function(err) {
        if (err) {
          return callback(err);
        }
        var widgetsByDocId = {};
        var ids = [];
        var projection = {
          title: 1,
          _url: 1
        };
        if (options.projection) {
          projection = options.projection;
        }
        _.each(widgets, function(widget) {
          if (!widget.permalinkIds) {
            return;
          }
          _.each(widget.permalinkIds, function(id) {
            widgetsByDocId[id] = widgetsByDocId[id] || [];
            widgetsByDocId[id].push(widget);
            ids.push(id);
          });
        });
        ids = _.uniq(ids);
        if (!ids.length) {
          return setImmediate(callback);
        }
        return self.apos.docs.find(req, {
          _id: {
            $in: ids
          }
        }, projection).toArray(function(err, docs) {
          if (err) {
            return callback(err);
          }
          _.each(docs, function(doc) {
            var widgets = widgetsByDocId[doc._id] || [];
            _.each(widgets, function(widget) {
              widget._permalinkDocs = widget._permalinkDocs || [];
              widget._permalinkDocs.push(doc);
            });
          });
          return callback(null);
        });
      });
    };

    var superOutput = self.output;

    self.output = function(widget, options) {
      var content = widget.content;
      var i;
      content = content || '';
      // "Why no regexps?" We need to do this as quickly as we can.
      // indexOf and lastIndexOf are much faster.
      _.each(widget._permalinkDocs || [], function(doc) {
        var offset = 0;
        while (true) {
          i = content.indexOf('apostrophe-permalink-' + doc._id, offset);
          if (i === -1) {
            break;
          }
          offset = i + ('apostrophe-permalink-' + doc._id).length;
          var updateTitle = content.indexOf('?updateTitle=1', i);
          if (updateTitle === i + ('apostrophe-permalink-' + doc._id).length) {
            updateTitle = true;
          } else {
            updateTitle = false;
          }
          // If you can edit the widget, you don't want the link replaced,
          // as that would lose the permalink if you edit the widget
          var left = content.lastIndexOf('<', i);
          var href = content.indexOf(' href="', left);
          var close = content.indexOf('"', href + 7);
          if (!widget._edit) {
            if ((left !== -1) && (href !== -1) && (close !== -1)) {
              content = content.substr(0, href + 6) + doc._url + content.substr(close + 1);
            } else {
              // So we don't get stuck in an infinite loop
              break;
            }
          }
          if (!updateTitle) {
            continue;
          }
          var right = content.indexOf('>', left);
          var nextLeft = content.indexOf('<', right);
          if ((right !== -1) && (nextLeft !== -1)) {
            content = content.substr(0, right + 1) + self.apos.utils.escapeHtml(doc.title) + content.substr(nextLeft);
          }
        }
      });
      // We never modify the original widget.content because we do not want
      // it to lose its permalinks in the database
      var _widget = _.assign({}, widget, { content: content });
      return superOutput(_widget, options);
    };

    var superSanitize = self.sanitize;
    self.sanitize = function(req, input, callback) {
      return superSanitize(req, input, function(err, output) {
        if (err) {
          return callback(err);
        }
        // For performance, keep a record of the permalink ids in
        // each widget, if any, so we can query efficiently and skip
        // queries where the feature is not used
        var anchors = output.content.match(/\"\#apostrophe-permalink-[^"?]*?\?/g);
        output.permalinkIds = _.map(anchors, function(anchor) {
          var matches = anchor.match(/apostrophe-permalink-(.*)\?/);
          var id = matches[1];
          return id;
        });
        return callback(null, output);
      });
    };

    self.on('apostrophe-workflow:resolveRelationships', 'resolvePermalinks', function(req, doc, toLocale) {
      var widgets = [];
      var widgetsByDocId = {};
      self.apos.docs.walk(doc, function(o, k, v, dotPath) {
        if ((o.type === self.name) && (o.permalinkIds && o.permalinkIds.length)) {
          widgets.push(o);
          _.each(o.permalinkIds, function(_id) {
            widgetsByDocId[_id] = widgetsByDocId[_id] || [];
            widgetsByDocId[_id].push(o);
          });
        }
      });
      var ids = _.flatten(
        _.map(widgets, 'permalinkIds')
      );
      ids = _.uniq(ids);
      var workflowGuidsToIds = {};
      var idsToNewIds = {};
      return self.apos.docs.db.find({
        _id: {
          $in: ids
        }
      }, {
        workflowGuid: 1
      }).toArray().then(function(docs) {
        _.each(docs, function(doc) {
          workflowGuidsToIds[doc.workflowGuid] = doc._id;
        });
        return self.apos.docs.db.find({
          workflowLocale: toLocale,
          workflowGuid: {
            $in: _.map(docs, 'workflowGuid')
          }
        }, {
          workflowGuid: 1
        }).toArray();
      }).then(function(docs) {
        _.each(docs, function(doc) {
          idsToNewIds[workflowGuidsToIds[doc.workflowGuid]] = doc._id;
        });
        _.each(widgets, function(widget) {
          var ids = widget.permalinkIds;
          _.each(ids, function(id) {
            if (!idsToNewIds[id]) {
              return;
            }
            widget.content = widget.content.replace(new RegExp(self.apos.utils.regExpQuote('apostrophe-permalink-' + id), 'g'), 'apostrophe-permalink-' + idsToNewIds[id]);
          });
          widget.permalinkIds = _.map(widget.permalinkIds, function(id) {
            return idsToNewIds[id] || id;
          });
        });
      });
    });

  }
};
