import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { GitUtil } from './utils/git.util';
import { ReportUtil } from './utils/report.util';
import { LintUtil } from './utils/lint.util';
import { TestFileUtil } from './utils/test-file.util';

export async function main(): Promise<void> {
    console.log(chalk.blue('🚀 Code Analyzer started!'));

    const gitUtil = new GitUtil();
    const reportUtil = new ReportUtil();
    const lintUtil = new LintUtil();
    const testFileUtil = new TestFileUtil();

    if (!await gitUtil.isGitRepository()) {
        console.error(chalk.red('❌ Not a git repository!'));
        process.exit(1);
    }

    const modifiedFiles = await gitUtil.getModifiedFiles();
    console.log(chalk.blue('📝 Modified files:'), modifiedFiles.length);

    if (modifiedFiles.length === 0) {
        console.log(chalk.yellow('📝 No modified files found'));
        return;
    }

    console.log(chalk.blue('\n🧪 Checking test files...'));
    const testFileResults = await testFileUtil.checkTestFiles(modifiedFiles);
    testFileUtil.printTestFileResults(testFileResults);

    const targetDir = path.join(process.cwd(), '.code-analyzer');
    await fs.remove(targetDir);
    await fs.ensureDir(targetDir);

    const typescriptFiles = modifiedFiles.filter(file =>
        file.endsWith('.ts') || file.endsWith('.tsx')
    );

    console.log(chalk.blue('📝 TypeScript files:'), typescriptFiles.length);

    if (typescriptFiles.length === 0) {
        console.log(chalk.yellow('📝 No TypeScript files found'));
        return;
    }

    for (const filePath of typescriptFiles) {
        if (!fs.pathExistsSync(filePath)) continue;

        console.log(chalk.gray(`\n🔍 Analyzing: ${filePath}`));

        const testFileCheck = testFileResults.get(filePath)!;

        const originalCopyName = reportUtil.generateUniqueFilename(filePath, 'original');
        const lintingCopyName = reportUtil.generateUniqueFilename(filePath, 'linting');

        const originalCopyPath = path.join(targetDir, originalCopyName);
        const lintingCopyPath = path.join(targetDir, lintingCopyName);
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const eslintReport = await lintUtil.eslintReport(filePath);
        const prettierReport = await lintUtil.prettierReport(filePath);
        fs.writeFileSync(lintingCopyPath, prettierReport.output || originalContent);
        fs.writeFileSync(originalCopyPath, originalContent);
        fs.writeFileSync(filePath, originalContent);
        reportUtil.addFileAnalysis({
            originalPath: filePath,
            originalCopyPath: originalCopyPath,
            lintingCopyPath: lintingCopyPath,
            eslintReport,
            prettierReport,
            gitStatus: { status: 'modified', staged: false },
            tests: testFileCheck
        });

        console.log(chalk.green(`✓ Analyzed: ${filePath}`));
        console.log(chalk.gray(`  ESLint: ${eslintReport.errorCount} errors, ${eslintReport.warningCount} warnings`));
        console.log(chalk.gray(`  Prettier: ${prettierReport.changes ? 'formatted' : 'no changes'}`));
    }

    await reportUtil.saveReport();

    const report = reportUtil.getReport();
    console.log(chalk.blue('\n📊 Analysis Summary:'));
    console.log(chalk.blue(`   Files: ${report.totalFiles}`));
    console.log(chalk.red(`   ESLint Errors: ${report.summary.eslint.totalErrors}`));
    console.log(chalk.yellow(`   ESLint Warnings: ${report.summary.eslint.totalWarnings}`));
    console.log(chalk.green(`   Prettier Formatted: ${report.summary.prettier.formattedFiles}`));
    console.log(chalk.blue(`   Test Files: ${report.summary.tests.hasTestFiles} valid, ${report.summary.tests.invalidTestFiles} invalid names, ${report.summary.tests.missingTestFiles} missing`));
    console.log(chalk.blue('\n🌐 Starting analysis server...'));
}
