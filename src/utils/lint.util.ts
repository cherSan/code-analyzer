import { ESLint } from 'eslint';
import prettier from 'prettier';
import chalk from 'chalk';
import * as fs from 'fs-extra';

export interface LintResult {
    filePath: string;
    errorCount: number;
    warningCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
    messages: Array<{
        line: number;
        column: number;
        ruleId: string;
        message: string;
        severity: number;
    }>;
}

export class LintUtil {
    private eslint: ESLint;

    constructor() {
        this.eslint = new ESLint({
            useEslintrc: false,
            baseConfig: {
                parserOptions: {
                    ecmaVersion: 2020,
                    sourceType: 'module',
                    ecmaFeatures: {
                        jsx: true
                    }
                },
                env: {
                    browser: true,
                    es2020: true,
                    node: true
                },
                rules: {
                    'no-unused-vars': 'warn',
                    'no-console': 'warn',
                    'no-debugger': 'error'
                }
            },
            fix: true // Включаем автофикс
        } as any);
    }

    /**
     * Lint array of files with auto-fix
     */
    async lintFiles(filePaths: string[]): Promise<LintResult[]> {
        console.log(chalk.blue('🔍 Linting files with auto-fix...'));

        const results: LintResult[] = [];

        for (const filePath of filePaths) {
            try {
                console.log(chalk.gray(`  Linting: ${filePath}`));

                // ESLint с автофиксом
                const lintResults = await this.eslint.lintFiles([filePath]);

                for (const result of lintResults) {
                    // Применяем фиксы
                    if (result.output) {
                        await fs.writeFile(filePath, result.output);
                        console.log(chalk.blue(`  🔧 Applied ESLint fixes to: ${filePath}`));
                    }

                    results.push({
                        filePath: result.filePath,
                        errorCount: result.errorCount,
                        warningCount: result.warningCount,
                        fixableErrorCount: result.fixableErrorCount,
                        fixableWarningCount: result.fixableWarningCount,
                        messages: result.messages.map(msg => ({
                            line: msg.line,
                            column: msg.column,
                            ruleId: msg.ruleId || '',
                            message: msg.message,
                            severity: msg.severity
                        }))
                    });

                    this.printFileResults(result);
                }

                // Prettier форматирование
                await this.formatWithPrettier(filePath);

            } catch (error) {
                console.error(chalk.red(`❌ Error linting ${filePath}:`), error);
            }
        }

        return results;
    }

    /**
     * Format file with Prettier
     */
    private async formatWithPrettier(filePath: string): Promise<void> {
        try {
            const content = await fs.readFile(filePath, 'utf8');

            // Проверяем, поддерживает ли Prettier этот файл
            const fileInfo = await prettier.getFileInfo(filePath);

            if (fileInfo.ignored || !fileInfo.inferredParser) {
                return;
            }

            const formatted = await prettier.format(content, {
                parser: fileInfo.inferredParser,
                semi: true,
                singleQuote: true,
                trailingComma: 'es5'
            });

            if (formatted !== content) {
                await fs.writeFile(filePath, formatted);
                console.log(chalk.blue(`  💅 Formatted with Prettier: ${filePath}`));
            }
        } catch (error) {
            console.error(chalk.yellow(`⚠ Prettier formatting skipped for ${filePath}:`), error);
        }
    }

    /**
     * Print lint results for a single file
     */
    private printFileResults(result: ESLint.LintResult): void {
        const relativePath = result.filePath.replace(process.cwd(), '').replace(/^\//, '');

        if (result.errorCount === 0 && result.warningCount === 0) {
            console.log(chalk.green(`✓ ${relativePath} - No issues`));
            return;
        }

        console.log(chalk.yellow(`📋 ${relativePath}:`));

        for (const message of result.messages) {
            const symbol = message.severity === 2 ? chalk.red('✗') : chalk.yellow('⚠');
            console.log(`  ${symbol} Line ${message.line}:${message.column} - ${message.message} ${chalk.gray(`(${message.ruleId})`)}`);
        }
    }

    /**
     * Get total statistics
     */
    getStats(results: LintResult[]): {
        totalErrors: number;
        totalWarnings: number;
        totalFiles: number;
        fixableErrors: number;
        fixableWarnings: number;
    } {
        const totalErrors = results.reduce((sum, result) => sum + result.errorCount, 0);
        const totalWarnings = results.reduce((sum, result) => sum + result.warningCount, 0);
        const fixableErrors = results.reduce((sum, result) => sum + result.fixableErrorCount, 0);
        const fixableWarnings = results.reduce((sum, result) => sum + result.fixableWarningCount, 0);

        return {
            totalErrors,
            totalWarnings,
            totalFiles: results.length,
            fixableErrors,
            fixableWarnings
        };
    }
}