/**
 * configuration.ts
 *
 * Handles reading, writing, and initializing VS Code workspace
 * settings for the Cucumber Step Definition Generator extension.
 *
 * All settings live under the "cucumberStepGen" namespace and
 * can be updated by the user via VS Code settings or the
 * Configure dialog.
 */

import * as vscode from "vscode";
import { StepDefinitionConfig } from "../types/types";

/**
 * Reads the current extension configuration from VS Code workspace settings.
 * Falls back to sensible defaults when a value has not been set.
 *
 * @returns A fully populated StepDefinitionConfig object.
 */
export function getConfiguration(): StepDefinitionConfig {
  const config = vscode.workspace.getConfiguration("cucumberStepGen");

  return {
    packageName: config.get("packageName", "com.example.stepdefinitions"),
    className: config.get("className", "StepDefinitions"),
    baseTestClass: config.get("baseTestClass", ""),
    imports: config.get("imports", []),
    annotations: config.get("annotations", []),
    framework: config.get("framework", "cucumber"),
  };
}

/**
 * Sets default configuration values the first time the extension
 * activates, so users always start with a working configuration.
 * Values that have already been customised are left untouched.
 */
export function initializeConfiguration(): void {
  const config = vscode.workspace.getConfiguration("cucumberStepGen");

  if (!config.has("packageName")) {
    config.update(
      "packageName",
      "com.example.stepdefinitions",
      vscode.ConfigurationTarget.Global,
    );
  }

  if (!config.has("className")) {
    config.update(
      "className",
      "StepDefinitions",
      vscode.ConfigurationTarget.Global,
    );
  }
}

/**
 * Opens a series of input prompts that let the user update the
 * most commonly changed settings without navigating to the
 * VS Code settings editor.
 *
 * If the user cancels any prompt the entire operation is aborted
 * and no settings are changed.
 */
export async function showConfigurationDialog(): Promise<void> {
  const config = getConfiguration();

  // Prompt for package name
  const packageName = await vscode.window.showInputBox({
    prompt: "Enter package name",
    value: config.packageName,
    placeHolder: "com.example.stepdefinitions",
  });

  // Abort if the user pressed Escape
  if (packageName === undefined) {
    return;
  }

  // Prompt for class name
  const className = await vscode.window.showInputBox({
    prompt: "Enter class name",
    value: config.className,
    placeHolder: "StepDefinitions",
  });

  if (className === undefined) {
    return;
  }

  // Prompt for optional base test class
  const baseClass = await vscode.window.showInputBox({
    prompt: "Enter base test class (optional)",
    value: config.baseTestClass,
    placeHolder: "BaseTest",
  });

  // Persist all three values together
  const vsConfig = vscode.workspace.getConfiguration("cucumberStepGen");
  await vsConfig.update(
    "packageName",
    packageName,
    vscode.ConfigurationTarget.Global,
  );
  await vsConfig.update(
    "className",
    className,
    vscode.ConfigurationTarget.Global,
  );
  await vsConfig.update(
    "baseTestClass",
    baseClass || "",
    vscode.ConfigurationTarget.Global,
  );

  vscode.window.showInformationMessage("Configuration updated successfully!");
}
