import {ESLint, Linter} from 'eslint';
import prettier from 'prettier';
import { readFileSync } from "fs-extra";
import { ESLintReport, PrettierReport, ESLintMessage } from '../types/analyzer.types';
import {Config} from "../types/config.types";

export class LintUtil {
    private readonly eslint: ESLint;
    private readonly eslintConfig?: Linter.Config;
    private readonly prettierConfig?: prettier.Options;

    constructor(config: Config) {
        this.eslintConfig = config.eslint;
        this.prettierConfig = config.prettier;

        console.log('ESLint Config:', this.eslintConfig);

        this.eslint = new ESLint({
            useEslintrc: false,
            ignore: false,
            overrideConfig: this.eslintConfig,
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
                ...this.prettierConfig,
            });

            const changes = formatted !== content;

            return { formatted: true, changes, input: content, output: formatted };
        } catch (error) {
            const content = readFileSync(filePath, 'utf8');
            return { formatted: false, changes: false, input: content, output: content };
        }
    }
}
