import {
  App,
  Editor,
  MarkdownView,
  Menu,
  MenuItem,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
} from 'obsidian';

interface CopyLinkSettings {
  // File commands
  enableCopyNoteLink: boolean;
  enableCopyNoteLinkAsFootnote: boolean;
  enableCopyNoteEmbed: boolean;
  // Block commands
  enableCopyBlockLink: boolean;
  enableCopyBlockEmbed: boolean;
  enableCopyBlockLinkAsFootnote: boolean;
  enableCopyBlockAnchorLink: boolean;
  enableCopyBlockURL: boolean;
  enableCopyBlockLinkWithSelection: boolean;
  // Heading behavior
  useBlockIdsForHeadings: boolean;
  // Notifications
  showNotifications: boolean;
}

const DEFAULT_SETTINGS: CopyLinkSettings = {
  enableCopyNoteLink: true,
  enableCopyNoteLinkAsFootnote: true,
  enableCopyNoteEmbed: true,
  enableCopyBlockLink: true,
  enableCopyBlockEmbed: true,
  enableCopyBlockLinkAsFootnote: true,
  enableCopyBlockAnchorLink: true,
  enableCopyBlockURL: true,
  enableCopyBlockLinkWithSelection: true,
  useBlockIdsForHeadings: false,
  showNotifications: true,
};

export default class CopyLinkPlugin extends Plugin {
  settings: CopyLinkSettings;

  async onload() {
    await this.loadSettings();

    // Register file context menu
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (!(file instanceof TFile) || file.extension !== 'md') return;

        if (this.settings.enableCopyNoteLink) {
          menu.addItem((item: MenuItem) => {
            item
              .setTitle('Copy note link')
              .setIcon('link')
              .onClick(() => this.copyNoteLink(file));
          });
        }

        if (this.settings.enableCopyNoteLinkAsFootnote) {
          menu.addItem((item: MenuItem) => {
            item
              .setTitle('Copy note link as footnote')
              .setIcon('link')
              .onClick(() => this.copyNoteLinkAsFootnote(file));
          });
        }

        if (this.settings.enableCopyNoteEmbed) {
          menu.addItem((item: MenuItem) => {
            item
              .setTitle('Copy note embed')
              .setIcon('link')
              .onClick(() => this.copyNoteEmbed(file));
          });
        }
      })
    );

    // Register editor context menu (for blocks)
    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu, editor, view) => {
        // Only show commands if view is a MarkdownView
        if (!(view instanceof MarkdownView)) return;

        if (this.settings.enableCopyBlockLink) {
          menu.addItem((item: MenuItem) => {
            item
              .setTitle('Copy block link')
              .setIcon('link')
              .onClick(() => this.copyBlockLink(editor, view));
          });
        }

        if (this.settings.enableCopyBlockEmbed) {
          menu.addItem((item: MenuItem) => {
            item
              .setTitle('Copy block embed')
              .setIcon('link')
              .onClick(() => this.copyBlockEmbed(editor, view));
          });
        }

        if (this.settings.enableCopyBlockLinkAsFootnote) {
          menu.addItem((item: MenuItem) => {
            item
              .setTitle('Copy block link as footnote')
              .setIcon('link')
              .onClick(() => this.copyBlockLinkAsFootnote(editor, view));
          });
        }

        if (this.settings.enableCopyBlockAnchorLink) {
          menu.addItem((item: MenuItem) => {
            item
              .setTitle('Copy anchor link')
              .setIcon('link')
              .onClick(() => this.copyBlockAnchorLink(editor, view));
          });
        }

        if (this.settings.enableCopyBlockURL) {
          menu.addItem((item: MenuItem) => {
            item
              .setTitle('Copy block URL')
              .setIcon('link')
              .onClick(() => this.copyBlockURL(editor, view));
          });
        }

        if (this.settings.enableCopyBlockLinkWithSelection) {
          menu.addItem((item: MenuItem) => {
            item
              .setTitle('Copy block link with selection as caption')
              .setIcon('link')
              .onClick(() => this.copyBlockLinkWithSelection(editor, view));
          });
        }
      })
    );

    // Add settings tab
    this.addSettingTab(new CopyLinkSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // Helper to show notices
  showNotice(message: string) {
    if (this.settings.showNotifications) {
      new Notice(message);
    }
  }

  // Extract H1 heading from file content
  extractH1Heading(content: string): string | null {
    const lines = content.split('\n');
    let startIndex = 0;

    // Skip frontmatter if it exists
    if (lines[0] && lines[0].trim() === '---') {
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          startIndex = i + 1;
          break;
        }
      }
    }

    // Find first non-empty line after frontmatter
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Check if it's a level 1 heading
        if (line.startsWith('# ')) {
          return line.substring(2).trim();
        } else {
          return null;
        }
      }
    }

    return null;
  }

  // Get unique path options for a file
  getUniquePathOptions(file: TFile): string[] {
    const currentTitle = file.basename;
    const fullPath = file.path;
    const pathWithoutExt = fullPath.replace(/\.[^/.]+$/, '');
    const pathParts = pathWithoutExt.split('/');

    // Find all markdown files
    const allFiles = this.app.vault.getMarkdownFiles();

    // Find files with same basename
    const filesWithSameBasename = allFiles.filter(
      (f) => f.basename === currentTitle && f.path !== fullPath
    );

    const pathOptions: string[] = [];

    // If in root or no duplicates, just use basename
    if (pathParts.length === 1 || filesWithSameBasename.length === 0) {
      pathOptions.push(currentTitle);
      return pathOptions;
    }

    // Add increasingly specific paths
    for (let i = 0; i < pathParts.length; i++) {
      const pathSegments = pathParts.slice(
        pathParts.length - 1 - i,
        pathParts.length
      );
      const pathOption = pathSegments.join('/');

      // Check uniqueness
      let isUnique = true;
      const optionParts = pathOption.split('/');
      const lastParts = optionParts.length;

      for (const otherFile of allFiles) {
        if (otherFile.path === fullPath) continue;

        const filePath = otherFile.path.replace(/\.[^/.]+$/, '');
        const filePathParts = filePath.split('/');

        if (filePathParts.length < lastParts) continue;

        const fileLastParts = filePathParts
          .slice(filePathParts.length - lastParts)
          .join('/');
        if (fileLastParts === pathOption) {
          isUnique = false;
          break;
        }
      }

      if (isUnique) {
        pathOptions.push(pathOption);
        break; // Return shortest unique path
      }
    }

    // If no unique path found, use full path
    if (pathOptions.length === 0) {
      pathOptions.push(pathWithoutExt);
    }

    return pathOptions;
  }

  async copyNoteLink(file: TFile) {
    const content = await this.app.vault.read(file);
    const pathOptions = this.getUniquePathOptions(file);
    const shortestPath = pathOptions[0];
    const h1Heading = this.extractH1Heading(content);

    // Build options
    const options: { text: string; value: string }[] = [];

    // Add path options
    options.push({ text: `[[${shortestPath}]]`, value: shortestPath });

    // Add caption options
    options.push({ text: '─────────────────────', value: '' });
    options.push({ text: 'Custom caption', value: 'custom' });
    if (h1Heading) {
      options.push({ text: 'H1', value: `${shortestPath}|${h1Heading}` });
    }
    options.push({
      text: 'Note title',
      value: `${shortestPath}|${file.basename}`,
    });
    options.push({ text: '^', value: `${shortestPath}|^` });

    // Show suggester (simplified version - direct copy)
    // For now, just copy the shortest unique path
    const wikilink = `[[${shortestPath}]]`;
    await navigator.clipboard.writeText(wikilink);
    this.showNotice('Copied to your clipboard');
  }

  async copyNoteLinkAsFootnote(file: TFile) {
    const pathOptions = this.getUniquePathOptions(file);
    const shortestPath = pathOptions[0];
    const wikilink = `^[[[${shortestPath}]]]`;
    await navigator.clipboard.writeText(wikilink);
    this.showNotice('Copied to your clipboard');
  }

  async copyNoteEmbed(file: TFile) {
    const pathOptions = this.getUniquePathOptions(file);
    const shortestPath = pathOptions[0];
    const embedLink = `![[${shortestPath}]]`;
    await navigator.clipboard.writeText(embedLink);
    this.showNotice('Copied to your clipboard');
  }

  // Generate random block ID
  generateBlockId(): string {
    return Math.random().toString(36).substr(2, 6);
  }

  // Check if line should have block ID inserted after
  shouldInsertAfter(line: string): boolean {
    return (
      line.trim().startsWith('>') || // blockquote
      line.trim().startsWith('```') || // code block
      line.trim().startsWith('|') || // table
      line.trim().match(/^#{1,6}\s/) !== null
    ); // heading
  }

  // Find existing block ID on or after the cursor line
  findExistingBlockId(editor: Editor, line: number): string | null {
    const currentLine = editor.getLine(line);

    // Check for inline block ID
    const inlineMatch = currentLine.match(/\s\^([a-zA-Z0-9-]+)$/);
    if (inlineMatch) {
      return inlineMatch[1];
    }

    // Check next line for standalone block ID
    if (line + 1 < editor.lineCount()) {
      const nextLine = editor.getLine(line + 1).trim();
      const standaloneMatch = nextLine.match(/^\^([a-zA-Z0-9-]+)$/);
      if (standaloneMatch) {
        return standaloneMatch[1];
      }
    }

    return null;
  }

  // Add or get block ID for a specific block object
  async addOrGetBlockIdForBlock(
    editor: Editor,
    block: any
  ): Promise<string | null> {
    const startLine = block.position.start.line;
    const endLine = block.position.end.line;

    // Check if block already has an ID
    if (block.id) return block.id;

    // Look for existing inline block ID on the last line of the block
    const lastLine = editor.getLine(endLine);
    const inlineMatch = lastLine.match(/\s\^([a-zA-Z0-9-]+)$/);
    if (inlineMatch) {
      return inlineMatch[1];
    }

    // Look for existing standalone block ID after the block
    const nextLineIndex = endLine + 1;
    if (nextLineIndex < editor.lineCount()) {
      const nextLine = editor.getLine(nextLineIndex).trim();
      const standaloneMatch = nextLine.match(/^\^([a-zA-Z0-9-]+)$/);
      if (standaloneMatch) {
        return standaloneMatch[1];
      }
    }

    // Generate new block ID
    const blockId = this.generateBlockId();

    // Determine where to insert the block ID
    // Use similar logic as the existing addOrGetBlockId function
    let targetLine = endLine;

    if (
      block.type === 'heading' ||
      block.type === 'blockquote' ||
      block.type === 'code' ||
      block.type === 'table' ||
      block.type === 'list'
    ) {
      // Insert on new line after for these block types
      const nextLineIndex = endLine + 1;
      const hasStandaloneId =
        nextLineIndex < editor.lineCount() &&
        editor
          .getLine(nextLineIndex)
          .trim()
          .match(/^\^([a-zA-Z0-9-]+)$/);

      if (!hasStandaloneId) {
        const insertPos =
          nextLineIndex < editor.lineCount() &&
          editor.getLine(nextLineIndex).trim() === ''
            ? nextLineIndex
            : nextLineIndex < editor.lineCount()
              ? nextLineIndex
              : endLine;
        const insertText =
          insertPos === nextLineIndex &&
          insertPos < editor.lineCount() &&
          editor.getLine(insertPos).trim() === ''
            ? `\n^${blockId}`
            : `\n\n^${blockId}`;

        editor.replaceRange(insertText, { line: endLine, ch: lastLine.length });
      }
    } else {
      // Insert inline for regular text blocks
      const lineLength = lastLine.length;
      editor.replaceRange(` ^${blockId}`, { line: endLine, ch: lineLength });
    }

    return blockId;
  }

  // Add or get block ID at cursor position
  async addOrGetBlockId(editor: Editor): Promise<string | null> {
    const cursor = editor.getCursor();
    const currentLine = cursor.line;
    const lineContent = editor.getLine(currentLine);

    // Check for existing block ID
    const existingId = this.findExistingBlockId(editor, currentLine);
    if (existingId) {
      return existingId;
    }

    // Generate new block ID
    const blockId = this.generateBlockId();

    if (this.shouldInsertAfter(lineContent)) {
      // Insert on new line after
      const lineEnd = editor.getLine(currentLine).length;
      editor.replaceRange(`\n^${blockId}`, { line: currentLine, ch: lineEnd });
    } else {
      // Insert inline at end of line
      const lineEnd = lineContent.length;
      editor.replaceRange(` ^${blockId}`, { line: currentLine, ch: lineEnd });
    }

    return blockId;
  }

  async copyBlockLink(editor: Editor, view: MarkdownView) {
    const file = view.file;
    if (!file) return;

    const pathOptions = this.getUniquePathOptions(file);
    const shortestPath = pathOptions[0];

    // Get block references from selection (works for both single and multi-block selections)
    const blockRefs = this.extractBlockReferencesFromSelection(
      editor,
      view,
      this.settings
    );

    if (blockRefs.length === 0) {
      this.showNotice('Could not find blocks in selection');
      return;
    }

    // Convert to full wikilinks
    const blockLinks = blockRefs.map((ref) => `[[${shortestPath}${ref}]]`);

    const finalLink = blockLinks.join('\n');
    await navigator.clipboard.writeText(finalLink);
    this.showNotice('Copied to your clipboard');
  }

  async copyBlockEmbed(editor: Editor, view: MarkdownView) {
    const file = view.file;
    if (!file) return;

    const pathOptions = this.getUniquePathOptions(file);
    const shortestPath = pathOptions[0];

    // Get block references from selection (works for both single and multi-block selections)
    const blockRefs = this.extractBlockReferencesFromSelection(
      editor,
      view,
      this.settings
    );

    if (blockRefs.length === 0) {
      this.showNotice('Could not find blocks in selection');
      return;
    }

    // Convert to full wikilinks
    const blockEmbeds = blockRefs.map((ref) => `![[${shortestPath}${ref}]]`);

    const finalEmbed = blockEmbeds.join('\n');
    await navigator.clipboard.writeText(finalEmbed);
    this.showNotice('Copied to your clipboard');
  }

  async copyBlockLinkAsFootnote(editor: Editor, view: MarkdownView) {
    const file = view.file;
    if (!file) return;

    const pathOptions = this.getUniquePathOptions(file);
    const shortestPath = pathOptions[0];

    // Get block references from selection (works for both single and multi-block selections)
    const blockRefs = this.extractBlockReferencesFromSelection(
      editor,
      view,
      this.settings
    );

    if (blockRefs.length === 0) {
      this.showNotice('Could not find blocks in selection');
      return;
    }

    // Convert to full wikilinks
    const blockFootnotes = blockRefs.map(
      (ref) => `^[[[${shortestPath}${ref}]]]`
    );

    const finalFootnote = blockFootnotes.join('\n');
    await navigator.clipboard.writeText(finalFootnote);
    this.showNotice('Copied to your clipboard');
  }

  async copyBlockAnchorLink(editor: Editor, view: MarkdownView) {
    // Get block references from selection (works for both single and multi-block selections)
    const blockRefs = this.extractBlockReferencesFromSelection(
      editor,
      view,
      this.settings
    );

    if (blockRefs.length === 0) {
      this.showNotice('Could not find blocks in selection');
      return;
    }

    const finalAnchor = blockRefs.join('\n');
    await navigator.clipboard.writeText(finalAnchor);
    this.showNotice('Copied to your clipboard');
  }

  // Handle cursor-only case (no selection)
  getBlockRefForCursor(
    editor: Editor,
    view: MarkdownView,
    settings: CopyLinkSettings
  ): string[] {
    const file = view.file;
    if (!file) return [];

    const fileCache = this.app.metadataCache.getFileCache(file);
    if (!fileCache) return [];

    const cursor = editor.getCursor();
    let foundBlock = false;

    // Find the section at cursor position
    for (const section of fileCache.sections || []) {
      if (
        cursor.line >= section.position.start.line &&
        cursor.line <= section.position.end.line
      ) {
        // Handle different section types (similar to main function)
        if (
          (section.type === 'paragraph' ||
            section.type === 'list' ||
            section.type === 'blockquote' ||
            section.type === 'callout') &&
          !section.id
        ) {
          // Generate new block ID for sections without one
          const newId = this.generateBlockId();
          editor.replaceRange(
            ` ^${newId}`,
            {
              line: section.position.end.line,
              ch: section.position.end.col,
            },
            {
              line: section.position.end.line,
              ch: section.position.end.col,
            }
          );
          return [`#^${newId}`];
        } else if (
          (section.type === 'paragraph' ||
            section.type === 'list' ||
            section.type === 'blockquote') &&
          section.id
        ) {
          // Use existing block ID
          return [`#^${section.id}`];
        } else if (section.type === 'heading') {
          if (settings.useBlockIdsForHeadings) {
            // Treat headings like regular blocks - generate block ID
            if (!section.id) {
              const newId = this.generateBlockId();
              editor.replaceRange(
                ` ^${newId}`,
                {
                  line: section.position.end.line,
                  ch: section.position.end.col,
                },
                {
                  line: section.position.end.line,
                  ch: section.position.end.col,
                }
              );
              return [`#^${newId}`];
            } else {
              return [`#^${section.id}`];
            }
          } else {
            // Use heading reference
            const headingInfo = fileCache.headings?.find(
              (h) => h.position.start.line === section.position.start.line
            );
            const headingText = headingInfo?.heading || '';
            const cleanHeading = headingText
              .replace(/\[|\]|#|\|/g, '')
              .replace(/:/g, ' ');
            return [`#${cleanHeading}`];
          }
        }

        foundBlock = true;
        break;
      }
    }

    return [];
  }

  // Extract all block references from a selection (based on obsidian42-text-transporter CC command approach)
  extractBlockReferencesFromSelection(
    editor: Editor,
    view: MarkdownView,
    settings: CopyLinkSettings
  ): string[] {
    const curSels = editor.listSelections();

    // Handle cursor-only case (no selection)
    if (!curSels || curSels.length === 0) {
      return this.getBlockRefForCursor(editor, view, settings);
    }

    const file = view.file;
    if (!file) return [];

    const fileCache = this.app.metadataCache.getFileCache(file);
    if (!fileCache) return [];

    const blockRefs: string[] = [];

    // Process each selection
    for (const sel of curSels) {
      const startLine = Math.min(sel.anchor.line, sel.head.line);
      const endLine = Math.max(sel.anchor.line, sel.head.line);

      // For each line in the selection, check which sections intersect with it
      for (let lineIdx = startLine; lineIdx <= endLine; lineIdx++) {
        // Skip lines that don't exist
        if (lineIdx >= editor.lineCount()) continue;

        // Find all sections that intersect with this line
        for (const section of fileCache.sections || []) {
          if (
            lineIdx >= section.position.start.line &&
            lineIdx <= section.position.end.line
          ) {
            // Handle different section types (similar to obsidian42-text-transporter)
            if (
              (section.type === 'paragraph' ||
                section.type === 'list' ||
                section.type === 'blockquote' ||
                section.type === 'callout') &&
              !section.id
            ) {
              // Generate new block ID for sections without one
              const newId = this.generateBlockId();
              const position =
                section.type === 'list'
                  ? {
                      line: lineIdx,
                      ch: editor.getLine(lineIdx).length,
                    }
                  : {
                      line: section.position.end.line,
                      ch: section.position.end.col,
                    };

              editor.replaceRange(` ^${newId}`, position, position);
              blockRefs.push(`#^${newId}`);
            } else if (
              (section.type === 'paragraph' ||
                section.type === 'list' ||
                section.type === 'blockquote') &&
              section.id
            ) {
              // Use existing block ID
              blockRefs.push(`#^${section.id}`);
            } else if (section.type === 'heading') {
              if (settings.useBlockIdsForHeadings) {
                // Treat headings like regular blocks - generate block ID
                if (!section.id) {
                  const newId = this.generateBlockId();
                  editor.replaceRange(
                    ` ^${newId}`,
                    {
                      line: section.position.end.line,
                      ch: section.position.end.col,
                    },
                    {
                      line: section.position.end.line,
                      ch: section.position.end.col,
                    }
                  );
                  blockRefs.push(`#^${newId}`);
                } else {
                  blockRefs.push(`#^${section.id}`);
                }
              } else {
                // Use heading reference (original behavior)
                // Access heading text from cache.headings
                const headingInfo = fileCache.headings?.find(
                  (h) => h.position.start.line === section.position.start.line
                );
                const headingText = headingInfo?.heading || '';
                const cleanHeading = headingText
                  .replace(/\[|\]|#|\|/g, '')
                  .replace(/:/g, ' ');
                blockRefs.push(`#${cleanHeading}`);
              }
            }

            // Move to the end of this section to avoid processing overlapping sections multiple times
            lineIdx = section.position.end.line;
            break;
          }
        }
      }
    }

    // Remove duplicates
    const uniqueRefs = [...new Set(blockRefs)];
    return uniqueRefs;
  }

  // Legacy functions - replaced by extractBlockReferencesFromSelection
  selectionSpansMultipleBlocks(editor: Editor, view: MarkdownView): boolean {
    return true; // Always assume multi-block capable
  }

  extractBlocksFromSelection(editor: Editor, view: MarkdownView): any[] {
    return []; // Legacy - use extractBlockReferencesFromSelection instead
  }

  // Custom encoding function that handles parentheses
  encodeObsidianPath(str: string): string {
    return encodeURIComponent(str).replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

  async copyBlockURL(editor: Editor, view: MarkdownView) {
    const file = view.file;
    if (!file) return;

    // Get block references from selection (works for both single and multi-block selections)
    const blockRefs = this.extractBlockReferencesFromSelection(
      editor,
      view,
      this.settings
    );

    if (blockRefs.length === 0) {
      this.showNotice('Could not find blocks in selection');
      return;
    }

    const vaultName = this.app.vault.getName();
    const encodedVault = this.encodeObsidianPath(vaultName);
    const pathWithoutExt = file.path.replace(/\.[^/.]+$/, '');
    const encodedPath = this.encodeObsidianPath(pathWithoutExt);

    // Convert to URLs - blockRefs are like "#^blockId" or "#Heading Name"
    const urls = blockRefs.map((ref) => {
      let urlAnchor = '';
      if (ref.startsWith('#^')) {
        // Block reference: keep the ^blockId format
        urlAnchor = ref.substring(1); // Remove the leading #
      } else if (ref.startsWith('#')) {
        // Heading reference: URL-encode for proper anchor format
        const headingText = ref.substring(1); // Remove the leading #
        urlAnchor = this.encodeObsidianPath(headingText);
      }
      return `obsidian://open?vault=${encodedVault}&file=${encodedPath}%23${urlAnchor}`;
    });

    const finalURLs = urls.join('\n');
    await navigator.clipboard.writeText(finalURLs);
    this.showNotice('URLs copied to your clipboard');
  }

  async copyBlockLinkWithSelection(editor: Editor, view: MarkdownView) {
    const file = view.file;
    if (!file) return;

    const blockId = await this.addOrGetBlockId(editor);
    if (!blockId) {
      this.showNotice('Could not create block link');
      return;
    }

    const pathOptions = this.getUniquePathOptions(file);
    const shortestPath = pathOptions[0];

    const selectedText = editor.getSelection().trim();
    let blockLink;

    if (selectedText) {
      // Create block link with selection as caption
      blockLink = `[[${shortestPath}#^${blockId}|${selectedText}]]`;
    } else {
      // Fallback to regular block link if no selection
      blockLink = `[[${shortestPath}#^${blockId}]]`;
    }

    await navigator.clipboard.writeText(blockLink);
    this.showNotice('Copied to your clipboard');
  }
}

class CopyLinkSettingTab extends PluginSettingTab {
  plugin: CopyLinkPlugin;

  constructor(app: App, plugin: CopyLinkPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // File commands section
    new Setting(containerEl)
      .setName('File commands')
      .setDesc('Control which commands appear in the file context menu.')
      .setHeading();

    new Setting(containerEl)
      .setName('Copy note link')
      .setDesc("Show 'Copy note link' in file context menu")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableCopyNoteLink)
          .onChange(async (value) => {
            this.plugin.settings.enableCopyNoteLink = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Copy note link as footnote')
      .setDesc("Show 'Copy note link as footnote' in file context menu")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableCopyNoteLinkAsFootnote)
          .onChange(async (value) => {
            this.plugin.settings.enableCopyNoteLinkAsFootnote = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Copy note embed')
      .setDesc("Show 'Copy note embed' in file context menu")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableCopyNoteEmbed)
          .onChange(async (value) => {
            this.plugin.settings.enableCopyNoteEmbed = value;
            await this.plugin.saveSettings();
          })
      );

    // Block commands section
    new Setting(containerEl)
      .setName('Block commands')
      .setDesc('Control which commands appear in the editor context menu.')
      .setHeading();

    new Setting(containerEl)
      .setName('Copy block link')
      .setDesc("Show 'Copy block link' in editor context menu")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableCopyBlockLink)
          .onChange(async (value) => {
            this.plugin.settings.enableCopyBlockLink = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Copy block embed')
      .setDesc("Show 'Copy block embed' in editor context menu")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableCopyBlockEmbed)
          .onChange(async (value) => {
            this.plugin.settings.enableCopyBlockEmbed = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Copy block link as footnote')
      .setDesc("Show 'Copy block link as footnote' in editor context menu")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableCopyBlockLinkAsFootnote)
          .onChange(async (value) => {
            this.plugin.settings.enableCopyBlockLinkAsFootnote = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Copy anchor link')
      .setDesc(
        "Show 'Copy anchor link' in editor context menu (creates [[#^blockId]])"
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableCopyBlockAnchorLink)
          .onChange(async (value) => {
            this.plugin.settings.enableCopyBlockAnchorLink = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Copy block URL')
      .setDesc(
        "Show 'Copy block URL' in editor context menu (creates obsidian://open URL)"
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableCopyBlockURL)
          .onChange(async (value) => {
            this.plugin.settings.enableCopyBlockURL = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Copy block link with selection as caption')
      .setDesc(
        "Show 'Copy block link with selection as caption' in editor context menu"
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableCopyBlockLinkWithSelection)
          .onChange(async (value) => {
            this.plugin.settings.enableCopyBlockLinkWithSelection = value;
            await this.plugin.saveSettings();
          })
      );

    // Heading behavior section
    new Setting(containerEl)
      .setName('Heading behavior')
      .setDesc('Control how heading blocks are handled.')
      .setHeading();

    new Setting(containerEl)
      .setName('Use block IDs for headings')
      .setDesc(
        'When enabled, heading blocks will be assigned block IDs and linked using ^blockId format. When disabled, headings use standard heading references.'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useBlockIdsForHeadings)
          .onChange(async (value) => {
            this.plugin.settings.useBlockIdsForHeadings = value;
            await this.plugin.saveSettings();
          })
      );

    // Notifications section
    new Setting(containerEl)
      .setName('Notifications')
      .setDesc('Control notification behavior.')
      .setHeading();

    new Setting(containerEl)
      .setName('Show notifications')
      .setDesc('Show notification when link is copied to clipboard')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showNotifications)
          .onChange(async (value) => {
            this.plugin.settings.showNotifications = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
