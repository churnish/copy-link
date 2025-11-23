import CopyLinkPlugin from '../main';
import { App } from 'obsidian';

describe('H1 Heading Extraction', () => {
	let plugin: CopyLinkPlugin;

	beforeEach(() => {
		const app = new App();
		plugin = new CopyLinkPlugin(app, {} as any);
	});

	describe('extractH1Heading', () => {
		it('should extract H1 heading from simple content', () => {
			const content = '# Main Heading\n\nSome content here';
			const heading = plugin.extractH1Heading(content);
			expect(heading).toBe('Main Heading');
		});

		it('should extract H1 with extra spaces', () => {
			const content = '#   Heading With Spaces   \n\nContent';
			const heading = plugin.extractH1Heading(content);
			expect(heading).toBe('Heading With Spaces');
		});

		it('should skip frontmatter and find H1', () => {
			const content = `---
title: Document Title
date: 2024-01-01
---

# Actual Heading

Content here`;
			const heading = plugin.extractH1Heading(content);
			expect(heading).toBe('Actual Heading');
		});

		it('should return null if first non-empty line is not H1', () => {
			const content = 'Regular text\n## H2 Heading';
			const heading = plugin.extractH1Heading(content);
			expect(heading).toBeNull();
		});

		it('should return null for H2 headings', () => {
			const content = '## H2 Heading\n\nContent';
			const heading = plugin.extractH1Heading(content);
			expect(heading).toBeNull();
		});

		it('should return null for H3-H6 headings', () => {
			expect(plugin.extractH1Heading('### H3 Heading')).toBeNull();
			expect(plugin.extractH1Heading('#### H4 Heading')).toBeNull();
			expect(plugin.extractH1Heading('##### H5 Heading')).toBeNull();
			expect(plugin.extractH1Heading('###### H6 Heading')).toBeNull();
		});

		it('should skip empty lines before H1', () => {
			const content = '\n\n\n# Heading After Empty Lines\n\nContent';
			const heading = plugin.extractH1Heading(content);
			expect(heading).toBe('Heading After Empty Lines');
		});

		it('should skip empty lines after frontmatter', () => {
			const content = `---
title: Test
---


# Heading After Spaces

Content`;
			const heading = plugin.extractH1Heading(content);
			expect(heading).toBe('Heading After Spaces');
		});

		it('should return null for empty content', () => {
			const heading = plugin.extractH1Heading('');
			expect(heading).toBeNull();
		});

		it('should return null for content with only whitespace', () => {
			const heading = plugin.extractH1Heading('   \n  \n  ');
			expect(heading).toBeNull();
		});

		it('should return null if frontmatter is not closed', () => {
			const content = `---
title: Test
This frontmatter never closes
# This is inside frontmatter`;
			const heading = plugin.extractH1Heading(content);
			expect(heading).toBeNull();
		});

		it('should handle H1 with special characters', () => {
			const content = '# Heading with [brackets] and (parens) & symbols!\n\nContent';
			const heading = plugin.extractH1Heading(content);
			expect(heading).toBe('Heading with [brackets] and (parens) & symbols!');
		});

		it('should handle H1 with inline code', () => {
			const content = '# Heading with `code` inside\n\nContent';
			const heading = plugin.extractH1Heading(content);
			expect(heading).toBe('Heading with `code` inside');
		});

		it('should handle H1 with links', () => {
			const content = '# Heading with [[wikilink]] and [markdown](link)\n\nContent';
			const heading = plugin.extractH1Heading(content);
			expect(heading).toBe('Heading with [[wikilink]] and [markdown](link)');
		});
	});
});
