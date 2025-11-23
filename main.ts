import { App, Editor, MarkdownView, MenuItem, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

interface CopyLinkSettings {
	// File commands
	enableCopyNoteLink: boolean;
	enableCopyNoteLinkAsFootnote: boolean;
	// Block commands
	enableCopyBlockLink: boolean;
	enableCopyBlockEmbed: boolean;
	// Notifications
	showNotifications: boolean;
}

const DEFAULT_SETTINGS: CopyLinkSettings = {
	enableCopyNoteLink: true,
	enableCopyNoteLinkAsFootnote: true,
	enableCopyBlockLink: true,
	enableCopyBlockEmbed: true,
	showNotifications: true
}

export default class CopyLinkPlugin extends Plugin {
	settings: CopyLinkSettings;

	async onload() {
		await this.loadSettings();

		// Register file context menu
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || file.extension !== 'md') {return;}

				if (this.settings.enableCopyNoteLink) {
					menu.addItem((item: MenuItem) => {
						item
							.setTitle("Copy note link")
							.setIcon("link")
							.onClick(() => this.copyNoteLink(file));
					});
				}

				if (this.settings.enableCopyNoteLinkAsFootnote) {
					menu.addItem((item: MenuItem) => {
						item
							.setTitle("Copy note link as footnote")
							.setIcon("link")
							.onClick(() => this.copyNoteLinkAsFootnote(file));
					});
				}
			})
		);

		// Register editor context menu (for blocks)
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				// Only show commands if view is a MarkdownView
				if (!(view instanceof MarkdownView)) {return;}

				if (this.settings.enableCopyBlockLink) {
					menu.addItem((item: MenuItem) => {
						item
							.setTitle("Copy block link")
							.setIcon("link")
							.onClick(() => this.copyBlockLink(editor, view));
					});
				}

				if (this.settings.enableCopyBlockEmbed) {
					menu.addItem((item: MenuItem) => {
						item
							.setTitle("Copy block embed")
							.setIcon("link")
							.onClick(() => this.copyBlockEmbed(editor, view));
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
		const pathWithoutExt = fullPath.replace(/\.[^/.]+$/, "");
		const pathParts = pathWithoutExt.split('/');

		// Find all markdown files
		const allFiles = this.app.vault.getMarkdownFiles();

		// Find files with same basename
		const filesWithSameBasename = allFiles.filter(f =>
			f.basename === currentTitle && f.path !== fullPath
		);

		const pathOptions: string[] = [];

		// If in root or no duplicates, just use basename
		if (pathParts.length === 1 || filesWithSameBasename.length === 0) {
			pathOptions.push(currentTitle);
			return pathOptions;
		}

		// Add increasingly specific paths
		for (let i = 0; i < pathParts.length; i++) {
			const pathSegments = pathParts.slice(pathParts.length - 1 - i, pathParts.length);
			const pathOption = pathSegments.join('/');

			// Check uniqueness
			let isUnique = true;
			const optionParts = pathOption.split('/');
			const lastParts = optionParts.length;

			for (const otherFile of allFiles) {
				if (otherFile.path === fullPath) {continue;}

				const filePath = otherFile.path.replace(/\.[^/.]+$/, "");
				const filePathParts = filePath.split('/');

				if (filePathParts.length < lastParts) {continue;}

				const fileLastParts = filePathParts.slice(filePathParts.length - lastParts).join('/');
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
		options.push({ text: "─────────────────────", value: "" });
		options.push({ text: "Custom caption", value: "custom" });
		if (h1Heading) {
			options.push({ text: "H1", value: `${shortestPath}|${h1Heading}` });
		}
		options.push({ text: "Note title", value: `${shortestPath}|${file.basename}` });
		options.push({ text: "^", value: `${shortestPath}|^` });

		// Show suggester (simplified version - direct copy)
		// For now, just copy the shortest unique path
		const wikilink = `[[${shortestPath}]]`;
		await navigator.clipboard.writeText(wikilink);
		this.showNotice("Copied to your clipboard");
	}

	async copyNoteLinkAsFootnote(file: TFile) {
		const pathOptions = this.getUniquePathOptions(file);
		const shortestPath = pathOptions[0];
		const wikilink = `^[[[${shortestPath}]]]`;
		await navigator.clipboard.writeText(wikilink);
		this.showNotice("Copied to your clipboard");
	}

	// Generate random block ID
	generateBlockId(): string {
		return Math.random().toString(36).substr(2, 6);
	}

	// Check if line should have block ID inserted after
	shouldInsertAfter(line: string): boolean {
		return line.trim().startsWith('>') || // blockquote
			line.trim().startsWith('```') || // code block
			line.trim().startsWith('|') || // table
			line.trim().match(/^#{1,6}\s/) !== null; // heading
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
		if (!file) {return;}

		const blockId = await this.addOrGetBlockId(editor);
		if (!blockId) {
			this.showNotice("Could not create block link");
			return;
		}

		const pathOptions = this.getUniquePathOptions(file);
		const shortestPath = pathOptions[0];
		const blockLink = `[[${shortestPath}#^${blockId}]]`;

		await navigator.clipboard.writeText(blockLink);
		this.showNotice("Copied to your clipboard");
	}

	async copyBlockEmbed(editor: Editor, view: MarkdownView) {
		const file = view.file;
		if (!file) {return;}

		const blockId = await this.addOrGetBlockId(editor);
		if (!blockId) {
			this.showNotice("Could not create block embed");
			return;
		}

		const pathOptions = this.getUniquePathOptions(file);
		const shortestPath = pathOptions[0];
		const blockEmbed = `![[${shortestPath}#^${blockId}]]`;

		await navigator.clipboard.writeText(blockEmbed);
		this.showNotice("Copied to your clipboard");
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
			.setName("File commands")
			.setDesc("Control which commands appear in the file context menu.")
			.setHeading();

		new Setting(containerEl)
			.setName("Copy note link")
			.setDesc("Show 'Copy note link' in file context menu")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableCopyNoteLink)
				.onChange(async (value) => {
					this.plugin.settings.enableCopyNoteLink = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Copy note link as footnote")
			.setDesc("Show 'Copy note link as footnote' in file context menu")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableCopyNoteLinkAsFootnote)
				.onChange(async (value) => {
					this.plugin.settings.enableCopyNoteLinkAsFootnote = value;
					await this.plugin.saveSettings();
				})
			);

		// Block commands section
		new Setting(containerEl)
			.setName("Block commands")
			.setDesc("Control which commands appear in the editor context menu.")
			.setHeading();

		new Setting(containerEl)
			.setName("Copy block link")
			.setDesc("Show 'Copy block link' in editor context menu")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableCopyBlockLink)
				.onChange(async (value) => {
					this.plugin.settings.enableCopyBlockLink = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Copy block embed")
			.setDesc("Show 'Copy block embed' in editor context menu")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableCopyBlockEmbed)
				.onChange(async (value) => {
					this.plugin.settings.enableCopyBlockEmbed = value;
					await this.plugin.saveSettings();
				})
			);

		// Notifications section
		new Setting(containerEl)
			.setName("Notifications")
			.setDesc("Control notification behavior.")
			.setHeading();

		new Setting(containerEl)
			.setName("Show notifications")
			.setDesc("Show notification when link is copied to clipboard")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showNotifications)
				.onChange(async (value) => {
					this.plugin.settings.showNotifications = value;
					await this.plugin.saveSettings();
				})
			);
	}
}
