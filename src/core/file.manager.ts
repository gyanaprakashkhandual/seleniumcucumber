/**
 * fileManager.ts
 *
 * Handles all file-system operations for the extension:
 *  - Creating a new step definition .java file in the workspace
 *  - Opening a generated string as a read-only preview document
 *
 * By isolating VS Code file API calls here, the rest of the codebase
 * stays testable and free of I/O concerns.
 */

import * as vscode from "vscode";
import * as path from "path";
import { StepDefinitionConfig } from "../types/types";
import { generateAdvancedStepDefinitions } from "./code.generator";
import { getConfiguration } from "../configs/configuration";

// ---------------------------------------------------------------------------
// File creation
// ---------------------------------------------------------------------------

/**
 * Prompts the user for a file name, then writes the provided Java
 * source content to that file in the workspace root and opens it
 * in the editor.
 *
 * If no content is provided, a default template file is generated
 * from the current configuration and three sample steps.
 *
 * @param content - Optional Java source string to write.
 *                  Falls back to a generated default when omitted.
 */
export async function createStepDefinitionFile(
  content?: string,
): Promise<void> {
  // If no content was passed in, produce a minimal working template
  if (!content) {
    content = await generateDefaultStepDefinitionFile();
  }

  // Ask the user what to name the file
  const fileName = await vscode.window.showInputBox({
    prompt: "Enter file name",
    value: "StepDefinitions.java",
    placeHolder: "StepDefinitions.java",
  });

  // Abort if the user pressed Escape
  if (!fileName) {
    return;
  }

  // Require an open workspace folder to know where to write the file
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage(
      "No workspace folder found. Please open a folder first.",
    );
    return;
  }

  const filePath = path.join(workspaceFolders[0].uri.fsPath, fileName);
  const uri = vscode.Uri.file(filePath);

  try {
    // Write bytes then open the new file in the active editor
    await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);
    vscode.window.showInformationMessage(
      `Step definition file created: ${fileName}`,
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to create file: ${error}`);
  }
}

/**
 * Generates a minimal step definition file using the current configuration
 * and three representative sample steps (Given / When / Then).
 *
 * This is the content that gets written when the user chooses
 * "Create Step Definition File" without first generating from a feature file.
 *
 * @returns A formatted Java source string.
 */
async function generateDefaultStepDefinitionFile(): Promise<string> {
  const config: StepDefinitionConfig = getConfiguration();

  const sampleSteps = [
    "Given I am on the homepage",
    "When I click on the login button",
    "Then I should see the login form",
  ];

  return await generateAdvancedStepDefinitions(sampleSteps, config);
}

// ---------------------------------------------------------------------------
// Output preview
// ---------------------------------------------------------------------------

/**
 * Opens the given Java source string as a temporary, unsaved document
 * with Java syntax highlighting in a side-by-side editor column.
 *
 * This lets users review the generated code before deciding whether
 * to save it to disk.
 *
 * @param content - Java source string to preview.
 */
export async function showOutputPreview(content: string): Promise<void> {
  const document = await vscode.workspace.openTextDocument({
    content,
    language: "java",
  });

  await vscode.window.showTextDocument(document, {
    preview: true,
    viewColumn: vscode.ViewColumn.Beside,
  });
}
