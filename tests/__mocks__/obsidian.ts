// Mock implementation of Obsidian API for testing

export class App {
	vault: Vault;
	workspace: Workspace;

	constructor() {
		this.vault = new Vault();
		this.workspace = new Workspace();
	}
}

export class Vault {
	private files: Map<string, TFile> = new Map();
	private fileContents: Map<string, string> = new Map();

	getMarkdownFiles(): TFile[] {
		return Array.from(this.files.values());
	}

	async read(file: TFile): Promise<string> {
		return this.fileContents.get(file.path) || '';
	}

	// Test helper methods
	_addFile(path: string, content: string = ''): TFile {
		const file = new TFile(path);
		this.files.set(path, file);
		this.fileContents.set(path, content);
		return file;
	}

	_clear() {
		this.files.clear();
		this.fileContents.clear();
	}
}

export class Workspace {
	private eventHandlers: Map<string, Function[]> = new Map();

	on(eventName: string, callback: Function): { unload: () => void } {
		if (!this.eventHandlers.has(eventName)) {
			this.eventHandlers.set(eventName, []);
		}
		this.eventHandlers.get(eventName)!.push(callback);
		return {
			unload: () => {
				const handlers = this.eventHandlers.get(eventName);
				if (handlers) {
					const index = handlers.indexOf(callback);
					if (index > -1) {
						handlers.splice(index, 1);
					}
				}
			}
		};
	}

	// Test helper to trigger events
	_trigger(eventName: string, ...args: any[]) {
		const handlers = this.eventHandlers.get(eventName) || [];
		handlers.forEach(handler => handler(...args));
	}
}

export class TFile {
	path: string;
	basename: string;
	extension: string;
	name: string;

	constructor(path: string) {
		this.path = path;
		this.name = path.split('/').pop() || '';
		this.basename = this.name.replace(/\.[^/.]+$/, '');
		this.extension = this.name.includes('.') ? this.name.split('.').pop() || '' : '';
	}
}

export class Plugin {
	app: App;
	manifest: PluginManifest;
	private data: any = {};

	constructor() {
		this.app = new App();
		this.manifest = {
			id: 'test-plugin',
			name: 'Test Plugin',
			version: '1.0.0',
			minAppVersion: '0.15.0',
			description: 'Test plugin',
			author: 'Test Author',
			authorUrl: '',
			isDesktopOnly: false
		};
	}

	async loadData(): Promise<any> {
		return this.data;
	}

	async saveData(data: any): Promise<void> {
		this.data = data;
	}

	addSettingTab(settingTab: any): void {
		// Mock implementation
	}

	registerEvent(event: any): void {
		// Mock implementation
	}
}

export class PluginSettingTab {
	app: App;
	plugin: Plugin;
	containerEl: HTMLElement;

	constructor(app: App, plugin: Plugin) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = document.createElement('div');
	}

	display(): void {
		// Mock implementation
	}

	hide(): void {
		// Mock implementation
	}
}

export class Setting {
	private settingEl: HTMLElement;

	constructor(containerEl: HTMLElement) {
		this.settingEl = document.createElement('div');
		containerEl.appendChild(this.settingEl);
	}

	setName(name: string): this {
		return this;
	}

	setDesc(desc: string): this {
		return this;
	}

	setHeading(): this {
		return this;
	}

	addToggle(callback: (toggle: any) => any): this {
		const toggle = {
			setValue: (value: boolean) => toggle,
			onChange: (callback: (value: boolean) => void) => toggle
		};
		callback(toggle);
		return this;
	}

	addText(callback: (text: any) => any): this {
		const text = {
			setValue: (value: string) => text,
			setPlaceholder: (placeholder: string) => text,
			onChange: (callback: (value: string) => void) => text
		};
		callback(text);
		return this;
	}
}

export class Notice {
	message: string;

	constructor(message: string) {
		this.message = message;
	}
}

export class Editor {
	private lines: string[] = [];
	private cursor: { line: number; ch: number } = { line: 0, ch: 0 };

	getCursor(): { line: number; ch: number } {
		return { ...this.cursor };
	}

	setCursor(pos: { line: number; ch: number }): void {
		this.cursor = { ...pos };
	}

	getLine(line: number): string {
		return this.lines[line] || '';
	}

	lineCount(): number {
		return this.lines.length;
	}

	replaceRange(replacement: string, from: { line: number; ch: number }, to?: { line: number; ch: number }): void {
		if (!to) {
			// Insert at position
			const line = this.lines[from.line] || '';
			this.lines[from.line] = line.slice(0, from.ch) + replacement + line.slice(from.ch);
		} else {
			// Replace range
			const startLine = this.lines[from.line] || '';
			const endLine = this.lines[to.line] || '';
			const before = startLine.slice(0, from.ch);
			const after = endLine.slice(to.ch);
			this.lines[from.line] = before + replacement + after;
			// Remove lines in between
			this.lines.splice(from.line + 1, to.line - from.line);
		}
	}

	// Test helper methods
	_setLines(lines: string[]): void {
		this.lines = [...lines];
	}

	_getLines(): string[] {
		return [...this.lines];
	}
}

export class MarkdownView {
	file: TFile | null = null;
	editor: Editor;

	constructor(file?: TFile) {
		this.file = file || null;
		this.editor = new Editor();
	}

	_setFile(file: TFile): void {
		this.file = file;
	}
}

export class Menu {
	private items: MenuItem[] = [];

	addItem(callback: (item: MenuItem) => void): this {
		const item = new MenuItem();
		this.items.push(item);
		callback(item);
		return this;
	}

	_getItems(): MenuItem[] {
		return this.items;
	}
}

export class MenuItem {
	private title: string = '';
	private icon: string = '';
	private clickHandler: (() => void) | null = null;

	setTitle(title: string): this {
		this.title = title;
		return this;
	}

	setIcon(icon: string): this {
		this.icon = icon;
		return this;
	}

	onClick(handler: () => void): this {
		this.clickHandler = handler;
		return this;
	}

	_click(): void {
		if (this.clickHandler) {
			this.clickHandler();
		}
	}

	_getTitle(): string {
		return this.title;
	}
}

export interface PluginManifest {
	id: string;
	name: string;
	version: string;
	minAppVersion: string;
	description: string;
	author: string;
	authorUrl: string;
	isDesktopOnly: boolean;
}
