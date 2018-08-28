// This code is for EDITORS, to allow them to follow the permalinks
// even though they are not replaced with the actual page URLs in
// the markup on the server side. We do not do that for editors
// because otherwise the permalink would be lost on the next edit.

(function() {
  $(window).on('hashchange', function() {
    // Typical case: hash link followed after page load
    return followPermalink();
  });
  $(function() {
    // On page load we could already have the hash
    followPermalink();
  });
  function followPermalink() {
    var hash = location.hash || '';
    var matches = hash.match(/#apostrophe-permalink-(.*?)\?/);
    if (matches) {
      var _id = matches[1];
      $.jsonCall('/modules/apostrophe-rich-text-permalinks/info', {
        _id: _id
      }, function(result) {
        if ((result.status === 'ok') && result.doc._url) {
          // This way the hashed version does not enter the history
          location.replace(result.doc._url);
        }
      });
      return false;
    }
  }
})();

