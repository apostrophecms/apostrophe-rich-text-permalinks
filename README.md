With this module, your users can create a link to a page in [ApostropheCMS](https://apostrophecms.org)...

<p align="center"><img src="https://raw.githubusercontent.com/apostrophecms/apostrophe-rich-text-permalinks/master/screenshots/screenshot-1.png" /></p>

By picking "Pages" from the "Link Types" menu in CKEditor...

<p align="center"><img src="https://raw.githubusercontent.com/apostrophecms/apostrophe-rich-text-permalinks/master/screenshots/screenshot-2.png" /></p>

... Then choosing a page in Apostrophe's page tree.

<p align="center"><img src="https://raw.githubusercontent.com/apostrophecms/apostrophe-rich-text-permalinks/master/screenshots/screenshot-3.png" /></p>

Users can click the usual "link" icon in the rich text editor, then pick "Document" from the "Link Types" dropdown menu.

Now they can click the "Browse Documents" button and select the page they wish to link to.

**The resulting link will always stay up to date, even if the page moves around the site and its slug changes.** This is the main advantage, in addition to the simple convenience of picking a page via the page tree.

## Installation

```
npm install apostrophe-rich-text-permalinks
```

```
// in app.js
modules: {
  'apostrophe-rich-text-permalinks': {}
}
```

## Linking to other document types

You can open this up to linking to other types via the `join` option:

```
// in app.js
modules: {
  'apostrophe-rich-text-permalinks': {
    join: {
      withType: 'apostrophe-blog-post'
    }
  }
}
```

You can even specify more than one type. Use the special type `apostrophe-page` to refer to all pages:

```
// in app.js
modules: {
  'apostrophe-rich-text-permalinks': {
    join: {
      // Either a page or a blog post
      withType: [ 'apostrophe-page', 'apostrophe-blog-post' ]
    }
  }
}
```

You may successfully create permalinks to any type of document that has a `_url` property when loaded, i.e. pieces that have corresponding `pieces-pages`, as well as regular pages.

## Projections

By default, a conservative projection is used for joined documents (only `title` and `_url` by default). You can pass your own projection like so:

```
// in app.js
modules: {
  'apostrophe-rich-text-widgets': {
    projection: {
      title: 1,
      _url: 1,
      attachment: 1
    }
  }
}
```

This is particularly useful if you're including something like `apostrophe-file` as a `join` option.

## Changing the label and buttons

By default, the new item on the "Link Type" dropdown and the "Browse" button both get labels based on the type of document you are joining with. But if you want to change this language, or you are using an array of types and find the word "Documents" underwhelming, you can set the `browseLabel` and `typeLabel` options of this module as you see fit.

## Things to be aware of

**While users are logged in with editing privileges,** the link will look like this:

`#apostrophe-permalink-ID-OF-PAGE?updateTitle=1`

However, for their convenience, if they click on it while the rich text editor is not active, it will still redirect to the right place.

**The link will always point directly to its destination** for all other site visitors, **including search engines,** which means the SEO is good.

On each page load that actually features permalinks, there is a small performance hit to load information about the current location of all the pages being linked to. However Apostrophe makes an effort to load these collectively rather than one at a time. There is no significant performance hit on pages that don't have permalinks.
