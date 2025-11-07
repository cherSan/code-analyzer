import { ESLint } from 'eslint';
import prettier from 'prettier';
import * as fs from 'fs-extra';
import { ESLintReport, PrettierReport, ESLintMessage } from '../types/analyzer.types';
import { esLintRules } from '../configs/eslint';
import { prettierRules } from '../configs/prettier';

export class LintUtil {
    private eslint: ESLint;

    constructor() {
        this.eslint = new ESLint({
            useEslintrc: false,
            ignore: false,
            baseConfig: {
                parser: '@typescript-eslint/parser',
                parserOptions: {
                    ecmaVersion: 2020,
                    sourceType: 'module',
                    ecmaFeatures: {
                        jsx: true
                    },
                    project: './tsconfig.json',
                    warnOnUnsupportedTypeScriptVersion: false
                },
                env: {
                    browser: true,
                    es2020: true,
                    node: true
                },
                settings: {
                    react: {
                        version: 'detect'
                    }
                },
                plugins: [
                    '@typescript-eslint',
                    'react',
                    'react-hooks',
                    'jsx-a11y',
                    'import'
                ],
                rules: esLintRules
            },
            fix: true
        } as any);
    }

    /**
     * Convert ESLint message to our format
     */
    private convertESLintMessage(msg: any): ESLintMessage {
        return {
            line: msg.line,
            column: msg.column,
            ruleId: msg.ruleId,
            message: msg.message,
            severity: msg.severity,
            nodeType: msg.nodeType || null,
            source: null,
            endLine: msg.endLine,
            endColumn: msg.endColumn,
            fix: msg.fix ? {
                range: [msg.fix.range[0], msg.fix.range[1]],
                text: msg.fix.text
            } : undefined,
            suggestions: msg.suggestions?.map((suggestion: any) => ({
                desc: suggestion.desc,
                fix: {
                    range: [suggestion.fix.range[0], suggestion.fix.range[1]],
                    text: suggestion.fix.text
                },
                messageId: suggestion.messageId
            }))
        };
    }

    /**
     * Analyze single file and return report
     */
    async analyzeFile(filePath: string): Promise<{
        eslintReport: ESLintReport;
        prettierReport: PrettierReport;
    }> {
        const originalContent = await fs.readFile(filePath, 'utf8');

        // ESLint analysis
        const eslintResults = await this.eslint.lintFiles([filePath]);
        const eslintResult = eslintResults[0] || {
            messages: [],
            errorCount: 0,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0
        };

        // Convert ESLint messages to our format
        const messages: ESLintMessage[] = eslintResult.messages.map(msg =>
            this.convertESLintMessage(msg)
        );

        const eslintReport: ESLintReport = {
            errorCount: eslintResult.errorCount,
            warningCount: eslintResult.warningCount,
            fixableErrorCount: eslintResult.fixableErrorCount,
            fixableWarningCount: eslintResult.fixableWarningCount,
            messages: messages,
            fixed: !!eslintResult.output,
            output: eslintResult.output
        };

        // Apply fixes if any
        if (eslintResult.output) {
            await fs.writeFile(filePath, eslintResult.output);
        }

        // Prettier analysis
        const prettierReport = await this.analyzeWithPrettier(filePath);

        return { eslintReport, prettierReport };
    }

    /**
     * Analyze file with Prettier
     */
    private async analyzeWithPrettier(filePath: string): Promise<PrettierReport> {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const fileInfo = await prettier.getFileInfo(filePath);

            if (fileInfo.ignored || !fileInfo.inferredParser) {
                return { formatted: false, changes: false, input: content, output: content };
            }

            const formatted = await prettier.format(content, {
                parser: fileInfo.inferredParser,
                filepath: filePath,
                ...prettierRules,
            });

            const changes = formatted !== content;
            if (changes) {
                await fs.writeFile(filePath, formatted);
            }

            return { formatted: true, changes, input: content, output: formatted };
        } catch (error) {
            const content = await fs.readFile(filePath, 'utf8');
            return { formatted: false, changes: false, input: content, output: content };
        }
    }
}