# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Obsidian community plugin (`copy-link`) that adds context menu commands for copying wikilinks, block links, embeds, footnotes, anchor links, and `obsidian://` URLs. Written in TypeScript, bundled with esbuild.

## Build commands

- **`npm run build`** — type-check with `tsc -noEmit`, then bundle for production.
- **`npm run dev`** — start esbuild in watch mode with inline sourcemaps.
- **No test or lint commands** — ESLint packages are installed but no config exists.

## Architecture

Single-file plugin in `main.ts` with two classes:

- **`CopyLinkPlugin extends Plugin`** — main plugin. Registers `file-menu` (note-level commands) and `editor-menu` (block-level commands) event listeners in `onload()`.
- **`CopyLinkSettingTab extends PluginSettingTab`** — settings UI with toggle switches for each command.

Key helper methods on the plugin class:

- **`getUniquePathOptions(file)`** — finds shortest unambiguous wikilink path by walking up the directory tree.
- **`extractBlockReferencesFromSelection(editor, view, settings)`** — uses `metadataCache` to find sections intersecting the editor selection, retrieves or creates `^blockId` identifiers by writing into the editor.
- **`extractH1Heading(content)`** — parses note content for H1, skipping frontmatter.

## Important conventions

- **`main.js` is the Obsidian entry point**, loaded directly by Obsidian at runtime. Must be rebuilt from `main.ts` before testing.
- **Block-copy commands are destructive** — they write `^blockId` tokens into the document as a side effect of copying. This is by design (Obsidian requires the ID to exist in the source file).
- **`obsidian`, `electron`, `@codemirror/*`, `@lezer/*`** are all external — provided by Obsidian at runtime, never bundled.
- **`esbuild.config.mjs`** uses top-level `await` and is invoked via `node esbuild.config.mjs [production]`.
