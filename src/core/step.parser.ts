/**
 * stepParser.ts
 *
 * Responsible for reading raw text from a Cucumber feature file,
 * identifying valid step lines, and transforming each step into a
 * structured ParsedStep object that the code generator can consume.
 *
 * Parsing is intentionally separated from code generation so that
 * each concern can be tested and extended independently.
 */

import { ParsedStep } from "../types/types";

/**
 * Regular expression that matches the five Cucumber step keywords
 * at the beginning of a trimmed line.
 */
const STEP_KEYWORD_PATTERN = /^(Given|When|Then|And|But)\s+/;

/**
 * Scans an array of trimmed lines and returns only those that
 * represent a valid Cucumber step (Given / When / Then / And / But).
 *
 * Lines that belong to feature metadata, comments, table rows,
 * or background blocks are silently skipped.
 *
 * Duplicate steps are removed so the generator does not produce
 * duplicate Java methods.
 *
 * "And" and "But" steps are normalised to "Given" because their
 * actual annotation depends on execution context which is not
 * available at parse time.
 *
 * @param lines - Array of trimmed strings from the feature file.
 * @returns Deduplicated array of normalised step strings.
 */
export function getValidCucumberSteps(lines: string[]): string[] {
  // Use a Set to automatically deduplicate identical steps
  const steps = new Set<string>();

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip blank lines
    if (!trimmedLine) {
      continue;
    }

    // Skip Gherkin structural keywords and comment lines
    const isMetadata =
      trimmedLine.startsWith("#") ||
      trimmedLine.startsWith("Feature:") ||
      trimmedLine.startsWith("Scenario:") ||
      trimmedLine.startsWith("Background:") ||
      trimmedLine.startsWith("Examples:") ||
      trimmedLine.startsWith("|");

    if (isMetadata) {
      continue;
    }

    if (STEP_KEYWORD_PATTERN.test(trimmedLine)) {
      // Normalise And/But to Given so the generator always has a
      // concrete annotation to emit. This can be enhanced later
      // with context-aware annotation selection.
      const normalizedStep = trimmedLine.replace(/^(And|But)\s+/, "Given ");
      steps.add(normalizedStep);
    }
  }

  return Array.from(steps);
}

/**
 * Converts a single raw Cucumber step string into a ParsedStep
 * object containing the annotation, clean step text, extracted
 * parameters, generated method name, and parameterised regex.
 *
 * Parameter extraction handles three patterns:
 *  - Double-quoted strings  → "(.*?)"   → String paramN
 *  - Angle-bracket tokens   → (.*)      → String tokenName
 *  - Bare integer literals  → (\\d+)    → int numberN
 *
 * @param step - A normalised step string (e.g. "Given I am on the login page").
 * @returns A ParsedStep object, or null if the line is not a valid step.
 */
export function parseStep(step: string): ParsedStep | null {
  const matches = step.match(/^(Given|When|Then|And|But)\s+(.*)$/);
  if (!matches) {
    return null;
  }

  // Map And/But to Given for annotation purposes
  const annotation =
    matches[1] === "And" || matches[1] === "But" ? "Given" : matches[1];
  const stepText = matches[2];

  const parameters: string[] = [];
  let parameterizedRegex = stepText;

  // Replace double-quoted strings with a named String parameter
  parameterizedRegex = parameterizedRegex.replace(/"([^"]*)"/g, () => {
    parameters.push(`String param${parameters.length + 1}`);
    return '"(.*?)"';
  });

  // Replace <angle-bracket> tokens with a named String parameter
  parameterizedRegex = parameterizedRegex.replace(
    /<([^>]*)>/g,
    (_match, content: string) => {
      const paramName = content.replace(/\s+/g, "_").toLowerCase();
      parameters.push(`String ${paramName}`);
      return "(.*)";
    },
  );

  // Replace bare integer literals with an int parameter
  parameterizedRegex = parameterizedRegex.replace(/\b\d+\b/g, () => {
    parameters.push(`int number${parameters.length + 1}`);
    return "(\\d+)";
  });

  const methodName = generateMethodName(stepText);

  return {
    originalStep: step,
    annotation,
    stepText,
    parameters,
    methodName,
    parameterizedRegex,
  };
}

/**
 * Converts arbitrary step text into a valid camelCase Java method name.
 *
 * Non-alphanumeric characters are stripped, words are title-cased
 * except the first one, and any leading digit is removed to keep
 * the identifier legal in Java.
 *
 * @param stepText - The step text without the keyword (e.g. "I am on the login page").
 * @returns A camelCase method name string, or "generatedStep" as a fallback.
 */
function generateMethodName(stepText: string): string {
  return (
    stepText
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join("")
      // Java identifiers cannot start with a digit
      .replace(/^\d+/, "") || "generatedStep"
  );
}
