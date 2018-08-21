console.log('plugin');

CKEDITOR.plugins.add('permalink', {
  icons: 'permalink',
  init: function(editor) {
    editor.addCommand('Permalink', new CKEDITOR.command(editor, {
      exec: function(editor) {
        // save the current position
        var range = editor.getSelection().getRanges()[ 0 ];
        apos.modules['apostrophe-rich-text-enhancements'].choosePermalink(function(err, doc) {
          editor.focus(); // focus the instance again
          range.select(); // restore the current position in the instance
          if (!err) {
            editor.insertHtml('<a href="#apostrophe-rich-text-enhancements-permalink:' + doc._id + '">' + apos.utils.escapeHtml(doc.title) + '</a>');
          }
        });
      }
    }));
    editor.ui.addButton('Permalink', {
      label: 'Insert Permalink',
      command: 'Permalink'
    });
  }
});
