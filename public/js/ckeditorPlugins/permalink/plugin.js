CKEDITOR.plugins.add('permalink', {
  init: function(editor) {
    var linkPlugin = CKEDITOR.plugins.link;
    var superParseLinkAttributes = linkPlugin.parseLinkAttributes;
    linkPlugin.parseLinkAttributes = function(editor, element) {
      var href = (element && (element.data('cke-saved-href') || element.getAttribute('href'))) || '';
      console.log('href is ' + href);
      var result = superParseLinkAttributes.call(this, editor, element);
      var matches = href.match(/^\#apostrophe-permalink-(.*)$/);
      console.log(matches);
      if (!matches) {
        return result;
      }
      return {
        type: 'doc',
        docId: matches[1]
      };
    };

    var superGetLinkAttributes = linkPlugin.getLinkAttributes;
    linkPlugin.getLinkAttributes = function(editor, data) {
      var result = superGetLinkAttributes.call(this, editor, data);
      console.log(data);
      var result = (function() {
        if ((data.type === 'doc') && data.docId) {
          var id = data.docId;
          return {
            set: {
              href: '#apostrophe-permalink-' + id
            },
            removed: result.removed
          };
        } else {
          result.removed.push('docId');
          return result;
        }

        return result;
      })();
      console.log(result);
      return result;
    };

    CKEDITOR.on('dialogDefinition', function(e) {

      console.log('in handler');
      if ((e.data.name !== 'link') || (e.editor !== editor)) {
        return;
      }

      var definition = e.data.definition;

      var linkType = get('linkType');
      linkType.items.push([ 'Document', 'doc' ]);
      definition.contents[0].elements.push({
        type: 'vbox',
        id: 'docOptions',
        children: [
          {
            type: 'button',
            id: 'docBrowse',
            label: 'Browse Documents',
            onClick: function() {
              var el = this;
              var $onTopOfCkeditor = $('<style>.apos-modal-blackout { z-index: 11000; } .apos-ui.apos-modal { z-index: 11100; }</style>');
              $('body').append($onTopOfCkeditor);
              return apos.modules['apostrophe-rich-text-enhancements'].choosePermalink(function(err, doc) {
                $onTopOfCkeditor.remove();
                if (err) {
                  // No change for now
                  return;
                }
                console.log(el);
                el.aposDocId = doc._id;
              });
            },
            commit: function(data) {
              data.docId = this.aposDocId;
            }
          }
        ]
      });

      var superOnChange = linkType.onChange;
      linkType.onChange = function() {
        var dialog = this.getDialog();
        var originalLayout = dialog.layout;
        // so we can put it off until we're ready
        dialog.layout = function() {};
        superOnChange.call(this);
        // restore so we can call it
        dialog.layout = originalLayout;
        var typeValue = this.getValue();
        var element = dialog.getContentElement('info', 'docOptions');
        if (element) {
          element = element.getElement().getParent().getParent();
          if ('docOptions' === typeValue + 'Options') {
            element.show();
          } else {
            element.hide();
          }
        }
        dialog.layout();
      };

      function get(id) {
        var result = null;
        _get(definition.contents);
        return result;
        function _get(o) {
          if (o.id === id) {
            result = o;
            return;
          }
          _.each(o, function(val, key) {
            if (key === '_') {
              // Do not infinitely recurse back into definition
              return;
            }
            if (val && ((typeof val) === 'object')) {
              _get(val);
              if (result) {
                return false;
              }
            }
          });
        }
      }
    });

  }
});
