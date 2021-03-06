CKEDITOR.plugins.add('permalink', {
  init: function(editor) {
    var linkPlugin = CKEDITOR.plugins.link;

    var superParseLinkAttributes = linkPlugin.parseLinkAttributes;
    linkPlugin.parseLinkAttributes = function(editor, element) {
      var href = (element && (element.data('cke-saved-href') || element.getAttribute('href'))) || '';
      var result = superParseLinkAttributes.call(this, editor, element);
      var matches = href.match(/^\#apostrophe-permalink-(.*)\?updateTitle=(\d)$/);
      if (!matches) {
        // defaults to true so if we do switch to a doc link it will be selected
        result.docUpdateTitle = true;
        return result;
      }

      return _.assign(result, {
        type: 'doc',
        docId: matches[1],
        docUpdateTitle: !!parseInt(matches[2])
      });
    };

    var superGetLinkAttributes = linkPlugin.getLinkAttributes;
    linkPlugin.getLinkAttributes = function(editor, data) {
      var result = superGetLinkAttributes.call(this, editor, data);

        if ((data.type === 'doc') && data.docId) {
          var id = data.docId;
          var url = '#apostrophe-permalink-' + id + '?updateTitle=' + (data.docUpdateTitle ? '1' : '0');
          _.assign(result.set, {
            'data-cke-saved-href': url,
            'href': url
          });
        } else {
          result.removed.push('docId');
        }

        return result;
    };

    CKEDITOR.on('dialogDefinition', function(e) {

      if ((e.data.name !== 'link') || (e.editor !== editor)) {
        return;
      }

      var definition = e.data.definition;

      var linkType = get('linkType');

      var superOnLinkTypeChanged = linkType.onChange;
      linkType.onChange = function() {
        superOnLinkTypeChanged.call(this);
        if (this.getValue() === 'doc' && editor.config.linkShowTargetTab) {
          this.getDialog().showPage('target');
        }
      };

      linkType.items.push([ apos.modules['apostrophe-rich-text-permalinks'].options.typeLabel, 'doc' ]);
      definition.contents[0].elements.push({
        type: 'vbox',
        id: 'docOptions',
        children: [
          {
            type: 'button',
            id: 'docBrowse',
            label: apos.modules['apostrophe-rich-text-permalinks'].options.browseLabel,
            setup: function(data) {
              this.aposDocId = data.docId;
            },
            onClick: function() {
              var el = this;
              var $onTopOfCkeditor = $('<style>.apos-modal-blackout { z-index: 11000; } .apos-ui.apos-modal { z-index: 11100; }</style>');
              $('body').append($onTopOfCkeditor);
              return apos.modules['apostrophe-rich-text-permalinks'].choosePermalink(function(err, doc) {
                $onTopOfCkeditor.remove();
                if (err) {
                  // No change for now
                  return;
                }
                el.aposDocId = doc._id;

                el.getDialog().getContentElement('info', 'docChosen').setValue(doc.title);
              });
            },
            commit: function(data) {
              data.docId = this.aposDocId;
            }
          },
          {
            type: 'text',
            id: 'docChosen',
            label: 'Document Chosen',
            required: false,
            setup: function(data) {
              this.disable();
              var el = this;
              if (data.docId) {
                return $.jsonCall('/modules/apostrophe-rich-text-permalinks/info', { _id: data.docId }, function(result) {
                  if (result.status !== 'ok') {
                    el.setValue('');
                  } else {
                    el.setValue(result.doc.title);
                  }
                });
              } else {
                el.setValue('');
              }
            }
          },
          {
            type: 'checkbox',
            id: 'docUpdateTitle',
            label: 'Always Show Current Title',
            required: false,
            onClick : function() {
              var el = this;
              var docTitle = el.getDialog()
                .getContentElement('info', 'docChosen').getValue();

              if (!docTitle) {
                return;
              }


              if(this.getValue()) {
                // If enabled, replace the `linkDisplayText` with the doc title.
                var currentText = el.getDialog()
                .getContentElement('info', 'linkDisplayText').getValue();

                el.getElement().setAttribute('data-permalink-orig-text', currentText);

                el.getDialog().getContentElement('info', 'linkDisplayText')
                  .setValue(docTitle);
              } else {
                // If disabled, return the original text to `linkDisplayText`
                var origText = el.getElement().getAttribute('data-permalink-orig-text');

                el.getDialog().getContentElement('info', 'linkDisplayText')
                  .setValue(origText);
              }
            },
            commit: function(data) {
              data.docUpdateTitle = !!this.getValue();
            }
          },
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
