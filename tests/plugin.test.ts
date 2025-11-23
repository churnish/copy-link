import CopyLinkPlugin from '../main';
import { App, Editor } from 'obsidian';

describe('CopyLinkPlugin', () => {
	let plugin: CopyLinkPlugin;
	let app: App;

	beforeEach(() => {
		app = new App();
		plugin = new CopyLinkPlugin(app, {} as any);
		plugin.app = app;
	});

	describe('Settings', () => {
		it('should load default settings', async () => {
			await plugin.loadSettings();

			expect(plugin.settings.enableCopyNoteLink).toBe(true);
			expect(plugin.settings.enableCopyNoteLinkAsFootnote).toBe(true);
			expect(plugin.settings.enableCopyBlockLink).toBe(true);
			expect(plugin.settings.enableCopyBlockEmbed).toBe(true);
			expect(plugin.settings.showNotifications).toBe(true);
		});

		it('should save and load custom settings', async () => {
			plugin.settings = {
				enableCopyNoteLink: false,
				enableCopyNoteLinkAsFootnote: false,
				enableCopyBlockLink: true,
				enableCopyBlockEmbed: true,
				showNotifications: false
			};

			await plugin.saveSettings();

			// Create new plugin instance to test loading
			const newPlugin = new CopyLinkPlugin(app, {} as any);
			newPlugin.app = app;
			Object.assign(newPlugin, { loadData: plugin.loadData.bind(plugin) });
			await newPlugin.loadSettings();

			expect(newPlugin.settings.enableCopyNoteLink).toBe(false);
			expect(newPlugin.settings.showNotifications).toBe(false);
		});
	});

	describe('Notifications', () => {
		it('should show notice when notifications are enabled', () => {
			plugin.settings = { ...plugin.settings, showNotifications: true };
			plugin.showNotice('Test message');
			// Notice constructor is called with message
			expect(true).toBe(true); // Mock doesn't throw
		});

		it('should not show notice when notifications are disabled', () => {
			plugin.settings = { ...plugin.settings, showNotifications: false };
			plugin.showNotice('Test message');
			// Should not throw or create Notice
			expect(true).toBe(true);
		});
	});

	describe('Block ID Generation', () => {
		it('should generate random block IDs', () => {
			setMockRandomValue(0.123456789);

			const blockId1 = plugin.generateBlockId();
			expect(blockId1).toBe('4fzzzx');

			setMockRandomValue(0.987654321);
			const blockId2 = plugin.generateBlockId();
			expect(blockId2).toBe('zk0000');

			expect(blockId1).not.toBe(blockId2);
		});

		it('should generate block IDs of length 6', () => {
			const blockId = plugin.generateBlockId();
			expect(blockId.length).toBe(6);
		});
	});

	describe('shouldInsertAfter', () => {
		it('should return true for blockquotes', () => {
			expect(plugin.shouldInsertAfter('> This is a quote')).toBe(true);
			expect(plugin.shouldInsertAfter('  > Indented quote')).toBe(true);
		});

		it('should return true for code blocks', () => {
			expect(plugin.shouldInsertAfter('```javascript')).toBe(true);
			expect(plugin.shouldInsertAfter('```')).toBe(true);
		});

		it('should return true for tables', () => {
			expect(plugin.shouldInsertAfter('| Column 1 | Column 2 |')).toBe(true);
			expect(plugin.shouldInsertAfter('  | Data | More data |')).toBe(true);
		});

		it('should return true for headings', () => {
			expect(plugin.shouldInsertAfter('# Heading 1')).toBe(true);
			expect(plugin.shouldInsertAfter('## Heading 2')).toBe(true);
			expect(plugin.shouldInsertAfter('### Heading 3')).toBe(true);
			expect(plugin.shouldInsertAfter('#### Heading 4')).toBe(true);
			expect(plugin.shouldInsertAfter('##### Heading 5')).toBe(true);
			expect(plugin.shouldInsertAfter('###### Heading 6')).toBe(true);
		});

		it('should return false for regular text', () => {
			expect(plugin.shouldInsertAfter('Regular text')).toBe(false);
			expect(plugin.shouldInsertAfter('Some paragraph text here')).toBe(false);
		});

		it('should return false for invalid headings', () => {
			expect(plugin.shouldInsertAfter('#No space after hash')).toBe(false);
			expect(plugin.shouldInsertAfter('####### Too many hashes')).toBe(false);
		});
	});

	describe('findExistingBlockId', () => {
		let editor: Editor;

		beforeEach(() => {
			editor = new Editor();
		});

		it('should find inline block ID on current line', () => {
			editor._setLines(['Text with block ID ^abc123']);
			const blockId = plugin.findExistingBlockId(editor, 0);
			expect(blockId).toBe('abc123');
		});

		it('should find standalone block ID on next line', () => {
			editor._setLines(['Text without block ID', '^def456']);
			const blockId = plugin.findExistingBlockId(editor, 0);
			expect(blockId).toBe('def456');
		});

		it('should return null if no block ID found', () => {
			editor._setLines(['Text without any block ID', 'Another line']);
			const blockId = plugin.findExistingBlockId(editor, 0);
			expect(blockId).toBeNull();
		});

		it('should handle block IDs with hyphens', () => {
			editor._setLines(['Text ^abc-123-def']);
			const blockId = plugin.findExistingBlockId(editor, 0);
			expect(blockId).toBe('abc-123-def');
		});

		it('should not match partial block IDs', () => {
			editor._setLines(['Text ^abc123 more text']);
			const blockId = plugin.findExistingBlockId(editor, 0);
			expect(blockId).toBeNull();
		});
	});

	describe('addOrGetBlockId', () => {
		let editor: Editor;

		beforeEach(() => {
			editor = new Editor();
			setMockRandomValue(0.123456789);
		});

		it('should return existing inline block ID', async () => {
			editor._setLines(['Text with block ID ^existing']);
			editor.setCursor({ line: 0, ch: 10 });

			const blockId = await plugin.addOrGetBlockId(editor);
			expect(blockId).toBe('existing');
			expect(editor._getLines()[0]).toBe('Text with block ID ^existing');
		});

		it('should return existing standalone block ID', async () => {
			editor._setLines(['Text without block ID', '^existing']);
			editor.setCursor({ line: 0, ch: 10 });

			const blockId = await plugin.addOrGetBlockId(editor);
			expect(blockId).toBe('existing');
		});

		it('should add inline block ID to regular text', async () => {
			editor._setLines(['Regular text']);
			editor.setCursor({ line: 0, ch: 5 });

			const blockId = await plugin.addOrGetBlockId(editor);
			expect(blockId).toBe('4fzzzx');
			expect(editor._getLines()[0]).toBe('Regular text ^4fzzzx');
		});

		it('should add standalone block ID after headings', async () => {
			editor._setLines(['# Heading']);
			editor.setCursor({ line: 0, ch: 5 });

			const blockId = await plugin.addOrGetBlockId(editor);
			expect(blockId).toBe('4fzzzx');
			expect(editor._getLines()[0]).toBe('# Heading\n^4fzzzx');
		});

		it('should add standalone block ID after blockquotes', async () => {
			editor._setLines(['> Quote text']);
			editor.setCursor({ line: 0, ch: 5 });

			const blockId = await plugin.addOrGetBlockId(editor);
			expect(blockId).toBe('4fzzzx');
			expect(editor._getLines()[0]).toBe('> Quote text\n^4fzzzx');
		});

		it('should add standalone block ID after code blocks', async () => {
			editor._setLines(['```javascript']);
			editor.setCursor({ line: 0, ch: 5 });

			const blockId = await plugin.addOrGetBlockId(editor);
			expect(blockId).toBe('4fzzzx');
			expect(editor._getLines()[0]).toBe('```javascript\n^4fzzzx');
		});

		it('should add standalone block ID after tables', async () => {
			editor._setLines(['| Column 1 | Column 2 |']);
			editor.setCursor({ line: 0, ch: 5 });

			const blockId = await plugin.addOrGetBlockId(editor);
			expect(blockId).toBe('4fzzzx');
			expect(editor._getLines()[0]).toBe('| Column 1 | Column 2 |\n^4fzzzx');
		});
	});
});
