import CopyLinkPlugin from '../main';
import { App } from 'obsidian';

describe('Unique Path Options', () => {
	let plugin: CopyLinkPlugin;
	let app: App;

	beforeEach(() => {
		app = new App();
		plugin = new CopyLinkPlugin(app, {} as any);
		plugin.app = app;
		// Clear vault before each test
		app.vault._clear();
	});

	describe('getUniquePathOptions', () => {
		it('should return basename for file in root with no duplicates', () => {
			const file = app.vault._addFile('note.md');
			const options = plugin.getUniquePathOptions(file);

			expect(options).toEqual(['note']);
			expect(options.length).toBe(1);
		});

		it('should return basename when no other files have same name', () => {
			app.vault._addFile('folder/note.md');
			app.vault._addFile('folder/other.md');
			const file = app.vault._addFile('folder/unique.md');

			const options = plugin.getUniquePathOptions(file);
			expect(options).toEqual(['unique']);
		});

		it('should return shortest unique path for duplicate basenames', () => {
			app.vault._addFile('project1/note.md');
			const file = app.vault._addFile('project2/note.md');

			const options = plugin.getUniquePathOptions(file);
			expect(options).toEqual(['project2/note']);
		});

		it('should handle multiple levels of nesting', () => {
			app.vault._addFile('a/b/note.md');
			const file = app.vault._addFile('x/y/note.md');

			const options = plugin.getUniquePathOptions(file);
			expect(options).toEqual(['y/note']);
		});

		it('should return full path when short paths are not unique', () => {
			app.vault._addFile('a/docs/note.md');
			app.vault._addFile('b/docs/note.md');
			const file = app.vault._addFile('c/docs/note.md');

			const options = plugin.getUniquePathOptions(file);
			expect(options).toEqual(['c/docs/note']);
		});

		it('should handle deeply nested duplicate files', () => {
			app.vault._addFile('a/b/c/d/note.md');
			app.vault._addFile('x/y/c/d/note.md');
			const file = app.vault._addFile('p/q/r/s/note.md');

			const options = plugin.getUniquePathOptions(file);
			// Should be unique at some level
			expect(options.length).toBe(1);
			expect(options[0]).toContain('note');
		});

		it('should handle single file in vault', () => {
			const file = app.vault._addFile('onlyfile.md');
			const options = plugin.getUniquePathOptions(file);

			expect(options).toEqual(['onlyfile']);
		});

		it('should handle files with same name in parent and child folders', () => {
			app.vault._addFile('project/note.md');
			const file = app.vault._addFile('project/sub/note.md');

			const options = plugin.getUniquePathOptions(file);
			expect(options).toEqual(['sub/note']);
		});

		it('should handle three files with same basename', () => {
			app.vault._addFile('folder1/note.md');
			app.vault._addFile('folder2/note.md');
			const file = app.vault._addFile('folder3/note.md');

			const options = plugin.getUniquePathOptions(file);
			expect(options).toEqual(['folder3/note']);
		});

		it('should handle files where basename is unique after removing extension', () => {
			app.vault._addFile('project/document.md');
			const file = app.vault._addFile('project/report.md');

			const options = plugin.getUniquePathOptions(file);
			expect(options).toEqual(['report']);
		});

		it('should return shortest unique path with mixed nesting levels', () => {
			app.vault._addFile('note.md');
			app.vault._addFile('a/note.md');
			const file = app.vault._addFile('a/b/note.md');

			const options = plugin.getUniquePathOptions(file);
			expect(options).toEqual(['b/note']);
		});

		it('should handle complex scenario with multiple duplicates at different levels', () => {
			app.vault._addFile('projects/2023/report.md');
			app.vault._addFile('projects/2024/report.md');
			app.vault._addFile('archive/projects/2023/report.md');
			const file = app.vault._addFile('personal/projects/2024/report.md');

			const options = plugin.getUniquePathOptions(file);
			expect(options[0]).toContain('report');
			// Should find some unique path
			expect(options.length).toBe(1);
		});

		it('should handle files in root vs nested with same basename', () => {
			app.vault._addFile('readme.md');
			const file = app.vault._addFile('docs/readme.md');

			const options = plugin.getUniquePathOptions(file);
			expect(options).toEqual(['docs/readme']);
		});

		it('should be case sensitive', () => {
			app.vault._addFile('folder/Note.md');
			const file = app.vault._addFile('folder/note.md');

			// These are different files with different basenames
			const options = plugin.getUniquePathOptions(file);
			expect(options).toEqual(['note']);
		});
	});
});
