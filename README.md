# Copy Link

Add commands to quickly copy links to files, headings and blocks.

## Key features

### File Commands

Available in the file context menu (right-click on files):

- **Copy note link** - Copies a wikilink to the note using the shortest unique path
- **Copy note link as footnote** - Copies the note link wrapped in an inline footnote: `^[[[link]]]`

### Block Commands

Available in the editor context menu (right-click in editor):

- **Copy block link** - Automatically adds or finds a block ID and copies a link to it: `[[note#^blockid]]`
- **Copy block embed** - Same as block link but prefixed with `!` for embedding: `![[note#^blockid]]`

## Install

> [!IMPORTANT]  
> The plugin is in active development — things can break, or change drastically between releases.
>
> **Ensure your files are regularly [backed up](https://help.obsidian.md/backup).**

Untill _Copy Link_ is [made availiable](https://github.com/obsidianmd/obsidian-releases/pull/8068) in the plugin directory, follow the steps below to install it.

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
