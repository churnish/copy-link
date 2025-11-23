# Test Suite Documentation

This directory contains comprehensive tests for the Copy Link Obsidian plugin.

## Test Structure

```
tests/
├── __mocks__/           # Mock implementations
│   └── obsidian.ts      # Obsidian API mocks
├── setup.ts             # Test setup and utilities
├── plugin.test.ts       # Core plugin functionality tests
├── heading-extraction.test.ts  # H1 heading extraction tests
├── unique-paths.test.ts # Unique path resolution tests
└── copy-links.test.ts   # Link copying operations tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:ci
```

### Run specific test file
```bash
npx jest plugin.test.ts
```

### Run tests matching a pattern
```bash
npx jest --testNamePattern="should extract H1"
```

## Test Coverage

The test suite aims for >70% coverage across all metrics:
- **Lines**: Percentage of code lines executed
- **Statements**: Percentage of statements executed
- **Functions**: Percentage of functions called
- **Branches**: Percentage of conditional branches taken

View coverage report after running tests:
```bash
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

## Test Categories

### 1. Plugin Tests (`plugin.test.ts`)
- Settings loading and saving
- Notification behavior
- Block ID generation
- Block ID insertion logic
- Finding existing block IDs

### 2. Heading Extraction (`heading-extraction.test.ts`)
- H1 heading detection
- Frontmatter handling
- Edge cases (empty content, no heading, wrong heading level)
- Special characters in headings

### 3. Unique Paths (`unique-paths.test.ts`)
- Path uniqueness resolution
- Duplicate file name handling
- Nested directory structures
- Edge cases (single file, root files, complex hierarchies)

### 4. Copy Link Operations (`copy-links.test.ts`)
- Copy note link
- Copy note link as footnote
- Copy block link
- Copy block embed
- Clipboard integration
- Error handling

## Mocking

### Obsidian API Mocks
The test suite includes comprehensive mocks for Obsidian's API:
- `App`, `Vault`, `Workspace`
- `Plugin`, `PluginSettingTab`
- `TFile`, `Editor`, `MarkdownView`
- `Menu`, `MenuItem`, `Setting`, `Notice`

### Clipboard API
The clipboard API is mocked to allow testing copy operations without actual clipboard access.

### Math.random()
Math.random is mocked for predictable block ID generation in tests.

## Writing New Tests

### Example test structure:
```typescript
describe('Feature Name', () => {
  let plugin: CopyLinkPlugin;

  beforeEach(() => {
    const app = new App();
    plugin = new CopyLinkPlugin(app, {} as any);
  });

  describe('specific functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test input';

      // Act
      const result = plugin.someMethod(input);

      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### Best Practices
1. **Arrange-Act-Assert**: Structure tests clearly
2. **One assertion per test**: Keep tests focused
3. **Descriptive names**: Use "should" statements
4. **Clean setup**: Use `beforeEach` for common setup
5. **Test edge cases**: Include error cases and boundaries
6. **Mock external dependencies**: Keep tests isolated

## Continuous Integration

Tests run automatically on:
- Every push to main/develop branches
- Every pull request
- Nightly comprehensive test suite
- Multiple Node.js versions (16, 18, 20, 21)
- Multiple operating systems (Ubuntu, Windows, macOS)

## Debugging Tests

### Run tests with verbose output
```bash
npx jest --verbose
```

### Debug specific test
```bash
node --inspect-brk node_modules/.bin/jest --runInBand plugin.test.ts
```

### View test coverage for specific file
```bash
npx jest --coverage --collectCoverageFrom="main.ts"
```

## Common Issues

### Tests failing due to mock issues
- Ensure mocks in `__mocks__/obsidian.ts` match actual API
- Check that test helpers are properly initialized

### Coverage threshold not met
- Add more test cases for uncovered branches
- Test edge cases and error conditions
- Verify all public methods have tests

### Flaky tests
- Check for timing issues or race conditions
- Ensure proper cleanup in `afterEach`
- Verify mocks are reset between tests

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass: `npm test`
3. Check coverage: `npm run test:ci`
4. Update this README if adding new test categories
