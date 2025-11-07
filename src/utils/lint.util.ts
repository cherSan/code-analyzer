import { ESLint } from 'eslint';
import chalk from 'chalk';

export interface LintResult {
    filePath: string;
    errorCount: number;
    warningCount: number;
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
            cwd: process.cwd(),
            fix: false
        });
    }

    /**
     * Lint array of files
     */
    async lintFiles(filePaths: string[]): Promise<LintResult[]> {
        console.log(chalk.blue('🔍 Linting files...'));

        const results: LintResult[] = [];

        for (const filePath of filePaths) {
            try {
                console.log(chalk.gray(`  Linting: ${filePath}`));

                const lintResults = await this.eslint.lintFiles([filePath]);

                for (const result of lintResults) {
                    results.push({
                        filePath: result.filePath,
                        errorCount: result.errorCount,
                        warningCount: result.warningCount,
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
            } catch (error) {
                console.error(chalk.red(`❌ Error linting ${filePath}:`), error);
            }
        }

        return results;
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
    getStats(results: LintResult[]): { totalErrors: number; totalWarnings: number; totalFiles: number } {
        const totalErrors = results.reduce((sum, result) => sum + result.errorCount, 0);
        const totalWarnings = results.reduce((sum, result) => sum + result.warningCount, 0);

        return {
            totalErrors,
            totalWarnings,
            totalFiles: results.length
        };
    }
}