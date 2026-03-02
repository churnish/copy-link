# Copy Link

Add commands to quickly copy links to files, headings and blocks.

## Key features

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

## Install

> [!IMPORTANT]  
> The plugin is in active development — things can break, or change drastically between releases.
>
> **Ensure your files are regularly [backed up](https://help.obsidian.md/backup).**

### File Commands

- **Copy note link** - Enable/disable "Copy note link" in file context menu
- **Copy note link as footnote** - Enable/disable "Copy note link as footnote" in file context menu
- **Copy note embed** - Enable/disable "Copy note embed" in file context menu

### Block Commands

- **Copy block link** - Enable/disable "Copy block link" in editor context menu
- **Copy block embed** - Enable/disable "Copy block embed" in editor context menu
- **Copy block link as footnote** - Enable/disable "Copy block link as footnote" in editor context menu
- **Copy anchor link** - Enable/disable "Copy anchor link" in editor context menu
- **Copy block URL** - Enable/disable "Copy block URL" in editor context menu
- **Copy block link with selection as caption** - Enable/disable "Copy block link with selection as caption" in editor context menu

### Heading behavior

- **Use block IDs for headings** - When enabled, heading blocks are treated like other blocks and get assigned block IDs (^xyz format). When disabled, headings use standard heading references (#heading-name format).

### Notifications

- **Show notifications** - Toggle clipboard notifications on/off

### BRAT (recommended)

1. Download and enable the community plugin [BRAT](https://obsidian.md/plugins?id=obsidian42-brat).
2. Open _BRAT_ settings.
3. Press _Add Beta Plugin_.
4. Paste https://github.com/greetclammy/copy-link in the text field.
5. Select _Latest version_.
6. Check _Enable after installing the plugin_.
7. Press _Add Plugin_.

### Install manually

Note: to get updates for _Copy Link_, you will have to check for and install them manually.

1. Download `copy-link.zip` in the `Assets` of the [latest release](https://github.com/greetclammy/copy-link/releases).
2. Unzip the folder and place it in the `.obsidian/plugins` folder (hidden on most OSes) at the root of your vault.
3. Reload plugins or app.
4. Enable _Copy Link_ in Obsidian settings > Community plugins > Installed plugins.

## Thanks

This plugin builds on [Copy Block Link](https://github.com/mgmeyers/obsidian-copy-block-link) and employs some of its code.
