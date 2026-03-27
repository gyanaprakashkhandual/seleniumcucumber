/**
 * types.ts
 *
 * Central type definitions used across the extension.
 * Keeping types in one place ensures consistency and
 * makes refactoring easier as the codebase grows.
 */

/**
 * Configuration options that control how step definitions are generated.
 * These values are read from VS Code workspace settings.
 */
export interface StepDefinitionConfig {
  /** Java package name for the generated class (e.g. "com.example.stepdefinitions") */
  packageName: string;

  /** Java class name for the generated step definition file (e.g. "StepDefinitions") */
  className: string;

  /** Optional base class the generated class should extend (e.g. "BaseTest") */
  baseTestClass: string;

  /** Additional import statements to include beyond the defaults */
  imports: string[];

  /** Additional annotations to apply to the generated class or methods */
  annotations: string[];

  /** The test framework to target: Cucumber, TestNG, or JUnit */
  framework: "cucumber" | "testng" | "junit";
}

/**
 * Represents a single parsed Cucumber step along with all
 * the metadata needed to generate its Java method.
 */
export interface ParsedStep {
  /** The raw original step string from the feature file */
  originalStep: string;

  /** The Cucumber annotation type: Given, When, or Then */
  annotation: string;

  /** The step text with keyword removed (e.g. "I am on the login page") */
  stepText: string;

  /** Java parameter declarations extracted from the step (e.g. ["String param1", "int number1"]) */
  parameters: string[];

  /** Camel-case Java method name derived from the step text */
  methodName: string;

  /** Regex-formatted step text with parameter placeholders for the annotation value */
  parameterizedRegex: string;
}
