import CopyLinkPlugin from '../main';
import { App, Editor, MarkdownView } from 'obsidian';

describe('Copy Link Operations', () => {
	let plugin: CopyLinkPlugin;
	let app: App;

	beforeEach(async () => {
		app = new App();
		plugin = new CopyLinkPlugin(app, {} as any);
		plugin.app = app;
		await plugin.loadSettings();
		app.vault._clear();
		jest.clearAllMocks();
	});

	describe('copyNoteLink', () => {
		it('should copy simple wikilink for unique file', async () => {
			const file = app.vault._addFile('unique-note.md', '# Test Heading\n\nContent');
			await plugin.copyNoteLink(file);

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('[[unique-note]]');
		});

		it('should copy wikilink with shortest unique path for duplicate names', async () => {
			app.vault._addFile('folder1/note.md');
			const file = app.vault._addFile('folder2/note.md', 'Content');

			await plugin.copyNoteLink(file);
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('[[folder2/note]]');
		});

		it('should handle file with H1 heading', async () => {
			const file = app.vault._addFile('note.md', '# Main Heading\n\nContent');
			await plugin.copyNoteLink(file);

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('[[note]]');
		});

		it('should handle file without H1 heading', async () => {
			const file = app.vault._addFile('note.md', 'Regular content\n\nMore content');
			await plugin.copyNoteLink(file);

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('[[note]]');
		});

		it('should handle file with frontmatter and H1', async () => {
			const content = `---
title: Test
---

# Main Heading

Content`;
			const file = app.vault._addFile('note.md', content);
			await plugin.copyNoteLink(file);

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('[[note]]');
		});
	});

	describe('copyNoteLinkAsFootnote', () => {
		it('should copy footnote-style wikilink for unique file', async () => {
			const file = app.vault._addFile('note.md', 'Content');
			await plugin.copyNoteLinkAsFootnote(file);

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('^[[[note]]]');
		});

		it('should copy footnote with shortest unique path for duplicates', async () => {
			app.vault._addFile('a/note.md');
			const file = app.vault._addFile('b/note.md', 'Content');

			await plugin.copyNoteLinkAsFootnote(file);
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('^[[[b/note]]]');
		});

		it('should handle deeply nested file', async () => {
			const file = app.vault._addFile('a/b/c/d/note.md', 'Content');
			await plugin.copyNoteLinkAsFootnote(file);

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('^[[[note]]]');
		});
	});

	describe('copyBlockLink', () => {
		let editor: Editor;
		let view: MarkdownView;

		beforeEach(() => {
			setMockRandomValue(0.123456789);
		});

		it('should create block link for regular text', async () => {
			const file = app.vault._addFile('note.md');
			view = new MarkdownView(file);
			editor = view.editor;
			editor._setLines(['Regular text']);
			editor.setCursor({ line: 0, ch: 5 });

			await plugin.copyBlockLink(editor, view);

			expect(editor._getLines()[0]).toBe('Regular text ^4fzzzx');
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('[[note#^4fzzzx]]');
		});

		it('should use existing block ID if present', async () => {
			const file = app.vault._addFile('note.md');
			view = new MarkdownView(file);
			editor = view.editor;
			editor._setLines(['Text with ID ^existing']);
			editor.setCursor({ line: 0, ch: 5 });

			await plugin.copyBlockLink(editor, view);

			expect(editor._getLines()[0]).toBe('Text with ID ^existing');
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('[[note#^existing]]');
		});

		it('should handle file with duplicate name', async () => {
			app.vault._addFile('a/note.md');
			const file = app.vault._addFile('b/note.md');
			view = new MarkdownView(file);
			editor = view.editor;
			editor._setLines(['Text']);
			editor.setCursor({ line: 0, ch: 0 });

			await plugin.copyBlockLink(editor, view);

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('[[b/note#^4fzzzx]]');
		});

		it('should add block ID after heading', async () => {
			const file = app.vault._addFile('note.md');
			view = new MarkdownView(file);
			editor = view.editor;
			editor._setLines(['## Heading']);
			editor.setCursor({ line: 0, ch: 5 });

			await plugin.copyBlockLink(editor, view);

			expect(editor._getLines()[0]).toBe('## Heading\n^4fzzzx');
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('[[note#^4fzzzx]]');
		});

		it('should handle standalone block ID on next line', async () => {
			const file = app.vault._addFile('note.md');
			view = new MarkdownView(file);
			editor = view.editor;
			editor._setLines(['## Heading', '^myblock']);
			editor.setCursor({ line: 0, ch: 5 });

			await plugin.copyBlockLink(editor, view);

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('[[note#^myblock]]');
		});
	});

	describe('copyBlockEmbed', () => {
		let editor: Editor;
		let view: MarkdownView;

		beforeEach(() => {
			setMockRandomValue(0.123456789);
		});

		it('should create block embed for regular text', async () => {
			const file = app.vault._addFile('note.md');
			view = new MarkdownView(file);
			editor = view.editor;
			editor._setLines(['Regular text']);
			editor.setCursor({ line: 0, ch: 5 });

			await plugin.copyBlockEmbed(editor, view);

			expect(editor._getLines()[0]).toBe('Regular text ^4fzzzx');
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('![[note#^4fzzzx]]');
		});

		it('should use existing block ID for embed', async () => {
			const file = app.vault._addFile('note.md');
			view = new MarkdownView(file);
			editor = view.editor;
			editor._setLines(['Text with ID ^existing']);
			editor.setCursor({ line: 0, ch: 5 });

			await plugin.copyBlockEmbed(editor, view);

			expect(editor._getLines()[0]).toBe('Text with ID ^existing');
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('![[note#^existing]]');
		});

		it('should handle file with duplicate name for embed', async () => {
			app.vault._addFile('x/note.md');
			const file = app.vault._addFile('y/note.md');
			view = new MarkdownView(file);
			editor = view.editor;
			editor._setLines(['Text']);
			editor.setCursor({ line: 0, ch: 0 });

			await plugin.copyBlockEmbed(editor, view);

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('![[y/note#^4fzzzx]]');
		});

		it('should create embed with block ID after blockquote', async () => {
			const file = app.vault._addFile('note.md');
			view = new MarkdownView(file);
			editor = view.editor;
			editor._setLines(['> Important quote']);
			editor.setCursor({ line: 0, ch: 5 });

			await plugin.copyBlockEmbed(editor, view);

			expect(editor._getLines()[0]).toBe('> Important quote\n^4fzzzx');
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('![[note#^4fzzzx]]');
		});
	});

	describe('Edge cases', () => {
		it('should handle copyBlockLink with no file in view', async () => {
			const view = new MarkdownView();
			view.file = null;
			const editor = view.editor;
			editor._setLines(['Text']);

			await plugin.copyBlockLink(editor, view);

			// Should exit early without copying
			expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
		});

		it('should handle copyBlockEmbed with no file in view', async () => {
			const view = new MarkdownView();
			view.file = null;
			const editor = view.editor;
			editor._setLines(['Text']);

			await plugin.copyBlockEmbed(editor, view);

			// Should exit early without copying
			expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
		});
	});
});
