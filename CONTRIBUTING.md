# Contributing

Thank you for your interest in contributing to Selenium-Cucumber Pro. All contributions — bug reports, feature requests, documentation improvements, and code changes — are welcome.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
   ```bash
   git clone https://github.com/gyanaprakashkhandual/seleniumcucumber.git
   cd seleniumcucumber
   ```
3. **Install** dependencies
   ```bash
   npm install
   ```
4. **Open** the project in VS Code and press `F5` to launch the Extension Development Host

## Reporting Bugs

Before opening an issue, please check that it has not already been reported. When filing a bug, include:

- VS Code version and operating system
- Extension version
- Steps to reproduce the issue
- Expected behaviour vs actual behaviour
- Any relevant error messages or screenshots

Open a bug report here: [GitHub Issues](https://github.com/gyanaprakashkhandual/seleniumcucumber/issues)

## Suggesting Features

Feature requests are welcome. Please open an issue with the label `enhancement` and describe:

- The problem you are trying to solve
- Your proposed solution
- Any alternatives you considered

## Submitting a Pull Request

1. Create a new branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes following the code style described below
3. Test your changes by running the extension with `F5`
4. Commit with a clear, descriptive message
   ```bash
   git commit -m "feat: add support for DataTable parameters"
   ```
5. Push your branch and open a Pull Request against `main`

## Code Style

- All source files are TypeScript — keep strict typing, no `any`
- Each function must have a JSDoc comment describing its purpose, parameters, and return value
- One responsibility per file — do not mix concerns
- Run `npm run lint` before submitting to catch formatting issues

## Commit Message Convention

Use the following prefixes to keep the history readable:

| Prefix      | Use for                                   |
| ----------- | ----------------------------------------- |
| `feat:`     | New feature                               |
| `fix:`      | Bug fix                                   |
| `docs:`     | Documentation only                        |
| `refactor:` | Code restructure without behaviour change |
| `test:`     | Adding or updating tests                  |
| `chore:`    | Build scripts, dependencies, tooling      |

## Questions

If you have questions that are not covered here, open a [GitHub Discussion](https://github.com/gyanaprakashkhandual/seleniumcucumber/discussions) and the maintainer will respond.
