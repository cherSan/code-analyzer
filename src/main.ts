import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { GitUtil } from './utils/git.util';
import { PathUtil } from './utils/path.util';
import { LintUtil } from './utils/lint.util';

export async function main(): Promise<void> {
    console.log(chalk.blue('🚀 Code Analyzer started!'));

    const gitUtil = new GitUtil();

    // Check if we're in a git repository
    if (!await gitUtil.isGitRepository()) {
        console.error(chalk.red('❌ Not a git repository!'));
        process.exit(1);
    }

    const modifiedFiles = await gitUtil.getModifiedFiles();

    if (modifiedFiles.length === 0) {
        console.log(chalk.yellow('📝 No modified files found'));
        return;
    }

    const targetDir = '.code-analyzer';

    try {
        // Clean target directory
        await fs.remove(targetDir);
        await fs.ensureDir(targetDir);
        console.log(chalk.green(`✓ Created directory: ${targetDir}`));

        const copiedFiles: string[] = [];

        // Copy modified files
        for (const filePath of modifiedFiles) {
            if (await fs.pathExists(filePath)) {
                const analyzerPath = PathUtil.getAnalyzerPath(filePath);
                await fs.ensureDir(path.dirname(analyzerPath));
                await fs.copy(filePath, analyzerPath);
                copiedFiles.push(analyzerPath);
                console.log(chalk.green(`✓ Copied: ${filePath}`));
            }
        }

        console.log(chalk.blue(`✅ Copied ${copiedFiles.length} files to ${targetDir}!`));

        // Lint the copied files
        const lintUtil = new LintUtil();
        const lintResults = await lintUtil.lintFiles(copiedFiles);
        const stats = lintUtil.getStats(lintResults);

        // Print summary
        console.log(chalk.blue('\n📊 Linting Summary:'));
        console.log(chalk.blue(`   Files: ${stats.totalFiles}`));
        console.log(chalk.red(`   Errors: ${stats.totalErrors}`));
        console.log(chalk.yellow(`   Warnings: ${stats.totalWarnings}`));

    } catch (error) {
        console.error(chalk.red('❌ Error:'), error);
        process.exit(1);
    }
}