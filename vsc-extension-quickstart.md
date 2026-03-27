# VS Code Extension Quickstart

Welcome to **Selenium-Cucumber Pro**. This file is a developer reference for anyone working on the extension source code.

---

## Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- [VS Code](https://code.visualstudio.com) v1.80 or later
- TypeScript knowledge is helpful but not required

---

## Setup

```bash
git clone https://github.com/gyanaprakashkhandual/seleniumcucumber.git
cd seleniumcucumber
npm install
```

---

## Running the Extension Locally

1. Open the project folder in VS Code
2. Press `F5` — this launches a new **Extension Development Host** window with the extension loaded
3. Open any `.feature` file in the new window
4. Press `Ctrl+Shift+G` to test generation

Changes to TypeScript source files require a restart of the Development Host (`Ctrl+Shift+F5`) to take effect.

---

## Project Structure

```
src/
  extension.ts        Activation entry point
  stepGenerator.ts    End-to-end generation pipeline
  stepParser.ts       Feature file parsing logic
  codeGenerator.ts    Java source emitter
  fileManager.ts      File creation and preview
  quickActions.ts     UI menus and dialogs
  configuration.ts    Settings management
  types.ts            Shared interfaces
```

---

## Key Files

| File            | Purpose                                                     |
| --------------- | ----------------------------------------------------------- |
| `package.json`  | Extension manifest — commands, keybindings, settings schema |
| `tsconfig.json` | TypeScript compiler options                                 |
| `.vscodeignore` | Files excluded from the packaged `.vsix`                    |
| `esbuild.js`    | Optional bundler config (only needed for production builds) |

---

## Useful Commands

```bash
npm run compile      # Compile TypeScript to JavaScript
npm run watch        # Watch mode — recompiles on save
npm run lint         # Run ESLint across all source files
npm run package      # Bundle and produce a .vsix file
```

---

## Publishing

To package the extension into a `.vsix` for sharing or marketplace upload:

```bash
npm install -g @vscode/vsce
vsce package
```

To publish directly to the VS Code Marketplace:

```bash
vsce publish
```

You will need a Personal Access Token from [Azure DevOps](https://dev.azure.com).

---

## Further Reading

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
