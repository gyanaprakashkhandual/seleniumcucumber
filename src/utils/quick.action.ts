/**
 * quickActions.ts
 *
 * Provides the Quick Actions menu and the About dialog that are
 * surfaced via the status bar button and the "cucumberStepGen.quickActions"
 * command.
 *
 * Keeping UI-only dialogs in a dedicated file prevents extension.ts
 * from growing into a monolith and makes it easy to add or remove
 * menu options without touching core logic.
 */

import * as vscode from "vscode";
import { generateStepDefinitions } from "../core/step.generator";
import { createStepDefinitionFile } from "../core/file.manager";
import { showConfigurationDialog } from "../configs/configuration";

// ---------------------------------------------------------------------------
// Quick Actions menu
// ---------------------------------------------------------------------------

/**
 * Displays a Quick Pick menu listing all top-level extension actions.
 * The selected item determines which handler is invoked.
 */
export async function showQuickActions(): Promise<void> {
  const actions = [
    {
      label: "Generate Step Definitions",
      description: "Generate step definitions from current file or selection",
      action: "generate",
    },
    {
      label: "Create Step Definition File",
      description: "Create a new step definition file in the workspace",
      action: "createFile",
    },
    {
      label: "Configure Settings",
      description: "Update package name, class name, and framework options",
      action: "configure",
    },
    {
      label: "About Extension",
      description: "View version and author information",
      action: "about",
    },
  ];

  const selected = await vscode.window.showQuickPick(actions, {
    placeHolder: "Select an action",
    matchOnDescription: true,
  });

  if (!selected) {
    // User dismissed the menu — nothing to do
    return;
  }

  switch (selected.action) {
    case "generate":
      await generateStepDefinitions();
      break;

    case "createFile":
      await createStepDefinitionFile();
      break;

    case "configure":
      await showConfigurationDialog();
      break;

    case "about":
      await showAboutDialog();
      break;
  }
}

// ---------------------------------------------------------------------------
// About dialog
// ---------------------------------------------------------------------------

/**
 * Displays a modal information dialog with the extension's version,
 * author, and feature summary.
 *
 * The modal flag ensures the user sees it even when other notifications
 * are queued.
 */
async function showAboutDialog(): Promise<void> {
  const message = [
    "Selenium-Cucumber Extension",
    "",
    "Version: 1.0.0",
    "Author: Gyana Prakash Khandual",
    "",
    "Features:",
    "  Generate step definitions from Cucumber steps",
    "  Support for parameterized steps",
    "  Configurable package and class names",
    "  Professional code formatting",
    "  Error handling and validation",
    "  Quick actions and keyboard shortcuts",
    "",
    "Support: github.com/gyanaprakashkhandual/selenium-cucumber-extension",
  ].join("\n");

  vscode.window.showInformationMessage(message, { modal: true });
}
