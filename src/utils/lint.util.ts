import {ESLint, Linter} from 'eslint';
import prettier from 'prettier';
import { readFileSync } from "fs-extra";
import { ESLintReport, PrettierReport, ESLintMessage } from '../types/analyzer.types';
import { esLintRules } from '../configs/eslint';
import { prettierRules } from '../configs/prettier';

export class LintUtil {
    private eslint: ESLint;

    constructor() {
        const baseConfig: Linter.Config = {
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
        };

        this.eslint = new ESLint({
            useEslintrc: false,
            ignore: false,
            baseConfig: baseConfig,
            fix: false,
        });
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
    async eslintReport(filePath: string): Promise<ESLintReport> {
        const eslintResults = await this.eslint.lintFiles([filePath]);
        const eslintResult = eslintResults[0] || {};

        const messages: ESLintMessage[] = eslintResult.messages.map(
            msg => this.convertESLintMessage(msg)
        );

        return {
            errorCount: eslintResult.errorCount,
            warningCount: eslintResult.warningCount,
            fixableErrorCount: eslintResult.fixableErrorCount,
            fixableWarningCount: eslintResult.fixableWarningCount,
            messages: messages,
            fixed: !!eslintResult.output,
            output: eslintResult.output
        };
    }

    /**
     * Analyze file with Prettier
     */
    async prettierReport(filePath: string): Promise<PrettierReport> {
        try {
            const content = readFileSync(filePath, 'utf8');
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

            return { formatted: true, changes, input: content, output: formatted };
        } catch (error) {
            const content = readFileSync(filePath, 'utf8');
            return { formatted: false, changes: false, input: content, output: content };
        }
    }
}
