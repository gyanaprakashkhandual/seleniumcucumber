/**
 * extension.ts
 *
 * VS Code extension entry point.
 *
 * This file is intentionally thin — its only job is to:
 *  1. Register all commands with the VS Code runtime
 *  2. Create and show the status bar button
 *  3. Call initializeConfiguration() so defaults are set on first run
 *
 * All business logic lives in dedicated modules:
 *  - stepGenerator.ts  — orchestrates the generation pipeline
 *  - stepParser.ts     — parses feature file text into structured data
 *  - codeGenerator.ts  — emits Java source from structured data
 *  - fileManager.ts    — handles file I/O and preview
 *  - configuration.ts  — reads/writes workspace settings
 *  - quickActions.ts   — Quick Actions menu and About dialog
 */

import * as vscode from "vscode";
import { generateStepDefinitions } from "./core/step.generator";
import { createStepDefinitionFile } from "./core/file.manager";
import {
  showConfigurationDialog,
  initializeConfiguration,
} from "./configs/configuration";
import { showQuickActions } from "./utils/quick.action";

/**
 * Called by VS Code when the extension is first activated.
 *
 * All disposables (commands, status bar items) are pushed onto
 * {@code context.subscriptions} so they are cleaned up automatically
 * when the extension is deactivated.
 *
 * @param context - The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext): void {
  // -------------------------------------------------------------------------
  // Command registrations
  // -------------------------------------------------------------------------

  /**
   * Primary command — generates step definitions from the active editor.
   * Bound to Ctrl+Shift+G in package.json keybindings.
   */
  const generateStepCommand = vscode.commands.registerCommand(
    "cucumberStepGen.generateStep",
    async () => await generateStepDefinitions(),
  );

  /**
   * Opens the multi-step configuration dialog.
   * Bound to Ctrl+Shift+Q via the Quick Actions menu.
   */
  const configCommand = vscode.commands.registerCommand(
    "cucumberStepGen.configure",
    async () => await showConfigurationDialog(),
  );

  /**
   * Creates a new step definition .java file in the workspace root.
   */
  const createFileCommand = vscode.commands.registerCommand(
    "cucumberStepGen.createStepFile",
    async () => await createStepDefinitionFile(),
  );

  /**
   * Opens the Quick Actions menu — also the default status bar button action.
   * Bound to Ctrl+Shift+Q in package.json keybindings.
   */
  const quickActionsCommand = vscode.commands.registerCommand(
    "cucumberStepGen.quickActions",
    async () => await showQuickActions(),
  );

  /**
   * Context-menu command — generates step definitions from the current
   * text selection only.  Registered separately so it can be shown
   * conditionally in the editor context menu via package.json menus.
   */
  const generateFromSelectionCommand = vscode.commands.registerCommand(
    "cucumberStepGen.generateFromSelection",
    async () => await generateStepDefinitions(true),
  );

  // Register all commands so they are disposed when the extension deactivates
  context.subscriptions.push(
    generateStepCommand,
    configCommand,
    createFileCommand,
    quickActionsCommand,
    generateFromSelectionCommand,
  );

  // -------------------------------------------------------------------------
  // Status bar button
  // -------------------------------------------------------------------------

  /**
   * Persistent status bar item visible in every editor.
   * Clicking it opens the Quick Actions menu.
   */
  const stepDefButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  stepDefButton.command = "cucumberStepGen.quickActions";
  stepDefButton.text = "$(code) Cucumber Steps";
  stepDefButton.tooltip =
    "Cucumber Step Definition Generator - Click for quick actions";
  stepDefButton.show();

  context.subscriptions.push(stepDefButton);

  // -------------------------------------------------------------------------
  // One-time initialisation
  // -------------------------------------------------------------------------

  // Seed default configuration values so the extension works out-of-the-box
  // without requiring the user to open settings first.
  initializeConfiguration();
}

/**
 * Called by VS Code when the extension is deactivated (e.g. on window close).
 *
 * All subscriptions registered via context.subscriptions are disposed
 * automatically by VS Code, so no explicit cleanup is needed here.
 * Add teardown logic here only for resources managed outside of subscriptions.
 */
export function deactivate(): void {
  // No additional cleanup required at this time.
}
