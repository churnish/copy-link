# Copy Link

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

## Installation

Until _Copy Link_ is [made available](https://github.com/obsidianmd/obsidian-releases/pull/8068) in the plugin directory, to install it:

1. Download and enable the [BRAT](https://churnish.github.io/http-protocol-redirector?r=obsidian://show-plugin?id=obsidian42-brat) plugin.
2. [Install via BRAT](https://churnish.github.io/http-protocol-redirector?r=obsidian://brat?plugin=churnish/copy-link).
3. Select **Add plugin**.

<details><summary>Install manually</summary>

Note: To get updates for _Copy Link_, you will have to check for and install them manually.

1. Download `copy-link.zip` in the `Assets` of the [latest release](https://github.com/churnish/copy-link/releases).
2. Open the vault folder in the system file manager.
3. Open your Obsidian configuration folder (`.obsidian` by default, hidden on most OSes).
4. Unzip `copy-link.zip` and place it in the `plugins` folder.
5. Reload plugins or app.
6. Enable _Copy Link_ in Obsidian settings → Community plugins → Installed plugins.

</details>

## Support

- Found a bug or have a feature request? [Open an issue](https://github.com/churnish/copy-link/issues).
- Have a question? [Start a discussion](https://github.com/churnish/copy-link/discussions).
- PRs welcome.

## Credits

This plugin builds on [Copy Block Link](https://github.com/mgmeyers/obsidian-copy-block-link) and employs some of its code.
