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

Until _Copy Link_ is [made available](https://github.com/obsidianmd/obsidian-releases/pull/8068) in the plugin directory, follow the steps below to install it:

1. Download and enable the [BRAT](https://obsidian.md/plugins?id=obsidian42-brat) plugin.
2. Run _Add a beta plugin for testing_ in the Command palette.
3. Paste https://github.com/churnish/copy-link in the text field.
4. Select _Latest version_.
5. Check _Enable after installing the plugin_.
6. Press _Add Plugin_.

<details><summary>Install manually</summary>

1. Download `copy-link.zip` in the `Assets` of the [latest release](https://github.com/churnish/copy-link/releases).
2. Open the vault folder in the system file manager.
3. Open your Obsidian configuration folder (`.obsidian` by default, hidden on most OSes).
4. Unzip `copy-link.zip` and place it in the `plugins` folder.
5. Reload plugins or app.
6. Enable _Copy Link_ in Obsidian settings > Community plugins > Installed plugins.

</details>

## Thanks

This plugin builds on [Copy Block Link](https://github.com/mgmeyers/obsidian-copy-block-link) and employs some of its code.
