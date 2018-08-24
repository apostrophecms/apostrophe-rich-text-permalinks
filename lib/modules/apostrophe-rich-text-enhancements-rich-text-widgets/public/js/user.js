// This code is for EDITORS, to allow them to follow the permalinks
// even though they are not replaced with the actual page URLs in
// the markup on the server side. We do not do that for editors
// because otherwise the permalink would be lost on the next edit.

$(window).on('hashchange', function() {
  var hash = location.hash || '';
  var matches = hash.match(/#apostrophe-permalink-(.*?)$\?/);
  if (matches) {
    var _id = matches[1];
    $.jsonCall('/modules/apostrophe-rich-text-enhancements/info', {
      _id: _id
    }, function(result) {
      if ((result.status === 'ok') && result.doc._url) {
        location.href = result.doc._url;
      }
    });
    return false;
  }
});
