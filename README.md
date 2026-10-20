Add commands to quickly copy links to files, headings and blocks.

## Features

### File Commands

Available in the file context menu (right-click on files):

- **Copy note link** - Copies a wikilink to the note using the shortest unique path
- **Copy note link as footnote** - Copies the note link wrapped in an inline footnote: `^[[[link]]]`
- **Copy note embed** - Copies an embed link to the note: `![[link]]`

### Block Commands

Available in the editor context menu (right-click in editor):

- **Copy block link** - Automatically adds or finds a block ID and copies a link to it: `[[note#^blockid]]`, works with multi-block selections (creates multiple links on separate lines)
- **Copy block embed** - Same as block link but prefixed with `!` for embedding: `![[note#^blockid]]`, works with multi-block selections (creates multiple embeds on separate lines)
- **Copy block link as footnote** - Same as block link but wrapped in footnote syntax: `^[[[note#^blockid]]]`, works with multi-block selections (creates multiple footnotes on separate lines)
- **Copy anchor link** - Copies just the block anchor without the file path: `[[#^blockid]]`, works with multi-block selections (creates multiple anchors on separate lines)
- **Copy block URL** - Creates an obsidian://open URL for the block: `obsidian://open?vault=...&file=...%23%5Eblockid`, works with multi-block selections (creates multiple URLs on separate lines)
- **Copy block link with selection as caption** - Creates a block link using the selected text as the caption: `[[note#^blockid|selected text]]`

## Support

- Found a bug or have a feature request? [Open an issue](https://github.com/churnish/copy-link/issues).
- Have a question? [Start a discussion](https://github.com/churnish/copy-link/discussions).
- Contributors welcome.

## Credits

This plugin builds on [Copy Block Link](https://community.obsidian.md/plugins/obsidian-copy-block-link) and employs some of its code.
