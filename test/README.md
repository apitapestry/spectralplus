# SpectralPlus Tests

This directory contains tests for the SpectralPlus linter application.

## Test Files

### help.test.mjs
Tests for the Commander.js CLI help screen functionality. These tests verify that:

- The `--help` and `-h` flags display help information correctly
- All command-line options are documented in the help output
- Each option shows its description and default value
- The help screen includes all 7 custom options:
  - `--errors`: Path to errors directory
  - `--exceptions`: Path to exceptions directory
  - `--excludes`: Comma-separated exclude patterns
  - `--includes`: Comma-separated include patterns
  - `--rules`: Path to rule set file
  - `--silent`: Silent mode flag
  - `--csv`: CSV output format flag

## Running Tests

Run all tests once:
```bash
npm test
```

Run tests in watch mode (re-runs on file changes):
```bash
npm run test:watch
```

Run tests with Vitest UI:
```bash
npm run test:ui
```

Run only help screen tests:
```bash
npm run test:help
```

## Test Framework

The tests use **Vitest** - a blazing fast unit test framework powered by Vite, which provides:
- ⚡️ Lightning fast test execution with smart watch mode
- 🎯 Compatible with Jest API (describe, it, expect)
- 📊 Beautiful test output and error messages
- 🔍 Built-in code coverage with v8
- 🎨 Optional UI for interactive test exploration
- 🔧 Native ESM and TypeScript support
- 💡 Smart and instant watch mode

### Why Vitest?

- **Fast**: Uses Vite's transformation pipeline for instant hot module reload
- **Modern**: Native ESM support, no configuration needed for modules
- **Developer Experience**: Beautiful error messages and test UI
- **Compatible**: Jest-compatible API makes migration easy

## Adding New Tests

To add new tests:

1. Create a new test file in the `test/` directory with the `.test.mjs` extension
2. Import the test utilities from Vitest:
   ```javascript
   import { describe, it, expect } from 'vitest';
   ```
3. Write your tests using `describe` and `it` blocks with `expect` assertions:
   ```javascript
   describe('My Feature', () => {
     it('should do something', () => {
       expect(result).toBe(expected);
     });
   });
   ```
4. Run `npm test` to execute all tests

## Vitest Assertions

Vitest provides a rich set of matchers:
- `expect(value).toBe(expected)` - Strict equality
- `expect(value).toEqual(expected)` - Deep equality
- `expect(value).toContain(item)` - Array/string contains
- `expect(value).toBeGreaterThanOrEqual(number)` - Number comparison
- `expect(value).toBeTruthy()` - Truthy check
- And many more...

See [Vitest Expect API](https://vitest.dev/api/expect.html) for full documentation.

