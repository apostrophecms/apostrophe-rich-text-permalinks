## Changelog

### 2.0.5 2020-06-17

- No longer defaults to the selected text being replaced by the document/page
title. If a user selects "Always Show Current Title," the display text will be
replaced by the doc title, but the original text will be stashed in case they
uncheck the box.
- Corrected documentation for applying a projection to the join. No code changes.

### 2.0.4

Support for the `target` attribute. Thanks to Antoine Beauvais-Lacasse.

### 2.0.3

Support for the `projection` option in case you have custom `setUrl` methods for your pieces that require other properties.

### 2.0.2

Fixed a bug that prevented links to a second doc in the same rich text widget from being correctly rewritten for SEO / frontend use.

### 2.0.1

Fixed re-editing an existing link that hasn't been sent to the database yet.

Improved documentation.

### 2.0.0

Initial release.
