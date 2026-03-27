/**
 * stepGenerator.ts
 *
 * Orchestrates the end-to-end step definition generation workflow:
 *
 *  1. Validate that a Cucumber feature file is open in the editor
 *  2. Extract the text to process (entire file or current selection)
 *  3. Parse valid step lines
 *  4. Generate Java source via codeGenerator
 *  5. Copy the result to the clipboard
 *  6. Offer follow-up actions (create file, preview, configure)
 *
 * This module is the only place that combines VS Code progress
 * notifications with the pure-logic modules (stepParser, codeGenerator).
 */

import * as vscode from "vscode";
import * as path from "path";
import { getConfiguration } from "../configs/configuration";
import { generateAdvancedStepDefinitions } from "./code.generator";
import { getValidCucumberSteps } from "./step.parser";
import { createStepDefinitionFile, showOutputPreview } from "./file.manager";
import { showConfigurationDialog } from "../configs/configuration";

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Main generation command handler.
 *
 * When {@code selectionOnly} is true (or the user has an active selection),
 * only the selected text is processed.  Otherwise the entire file is used.
 *
 * Progress is shown in a VS Code notification toast so the user has
 * visual feedback for larger feature files.
 *
 * @param selectionOnly - Force processing of selected text only.
 */
export async function generateStepDefinitions(
  selectionOnly = false,
): Promise<void> {
  try {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage(
        "No active editor found. Please open a Cucumber feature file.",
      );
      return;
    }

    const document = editor.document;

    // Warn (but don't block) if the file doesn't look like a feature file
    if (!isValidCucumberFile(document)) {
      const proceed = await vscode.window.showWarningMessage(
        "This doesn't appear to be a Cucumber feature file. Continue anyway?",
        "Yes",
        "No",
      );
      if (proceed !== "Yes") {
        return;
      }
    }

    // Run the full pipeline inside a progress notification
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Generating Step Definitions",
        cancellable: false,
      },
      async (progress) => {
        // Step 1 — determine the text scope
        progress.report({ increment: 10, message: "Parsing steps..." });

        let textToProcess: string;
        let selectionInfo: string;

        if (selectionOnly || !editor.selection.isEmpty) {
          textToProcess = document.getText(editor.selection).trim();
          const lineCount =
            editor.selection.end.line - editor.selection.start.line + 1;
          selectionInfo = ` (${lineCount} lines selected)`;
        } else {
          textToProcess = document.getText();
          selectionInfo = " (entire file)";
        }

        if (!textToProcess) {
          vscode.window.showWarningMessage("No content to process.");
          return;
        }

        // Step 2 — filter to valid Cucumber steps
        progress.report({ increment: 30, message: "Processing steps..." });

        const lines = textToProcess.split("\n").map((line) => line.trim());
        const validSteps = getValidCucumberSteps(lines);

        if (validSteps.length === 0) {
          vscode.window.showWarningMessage(
            `No valid Cucumber steps found${selectionInfo}. ` +
              "Make sure your steps start with Given, When, Then, or And.",
          );
          return;
        }

        // Step 3 — generate Java source
        progress.report({ increment: 40, message: "Generating code..." });

        const config = getConfiguration();
        const stepDefinitions = await generateAdvancedStepDefinitions(
          validSteps,
          config,
        );

        // Step 4 — write to clipboard
        progress.report({ increment: 80, message: "Copying to clipboard..." });

        await vscode.env.clipboard.writeText(stepDefinitions);

        progress.report({ increment: 100, message: "Complete!" });

        // Step 5 — offer follow-up actions
        const action = await vscode.window.showInformationMessage(
          `Generated ${validSteps.length} step definition(s)${selectionInfo} and copied to clipboard!`,
          "Create File",
          "View Output",
          "Configure",
        );

        if (action === "Create File") {
          await createStepDefinitionFile(stepDefinitions);
        } else if (action === "View Output") {
          await showOutputPreview(stepDefinitions);
        } else if (action === "Configure") {
          await showConfigurationDialog();
        }
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    vscode.window.showErrorMessage(
      `Error generating step definitions: ${message}`,
    );
    console.error("Step generation error:", error);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determines whether the given document is likely a Cucumber feature file
 * by checking the file extension and scanning for Gherkin keywords.
 *
 * The check is deliberately lenient — it only warns rather than blocking —
 * so power users can still generate steps from plain-text files.
 *
 * @param document - The VS Code text document to inspect.
 * @returns true if the file appears to be a Cucumber feature file.
 */
function isValidCucumberFile(document: vscode.TextDocument): boolean {
  const fileName = path.basename(document.fileName).toLowerCase();
  const fileContent = document.getText();

  return (
    fileName.endsWith(".feature") ||
    /^\s*(Feature:|Scenario:|Given|When|Then|And)/m.test(fileContent)
  );
}
