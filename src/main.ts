import * as fs from 'fs-extra';
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

    const typescriptFiles = modifiedFiles.filter(file =>
        file.endsWith('.ts') || file.endsWith('.tsx')
    );

    reportUtil.cleanUpMainReport(typescriptFiles);

    for (const filePath of typescriptFiles) {
        console.log(chalk.gray(`\n🔍 Analyzing: ${filePath}`));
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const testReport = testFileUtil.checkTestFile(filePath);
        const eslintReport = await lintUtil.eslintReport(filePath);
        const prettierReport = await lintUtil.prettierReport(filePath);

        reportUtil.saveFileReport(
            filePath,
            {
                original_file_path: filePath,
                original_file_content: originalContent,
                linted_file_content: prettierReport.output,
                eslint_report: eslintReport,
                prettier_report: prettierReport,
                test_report: testReport,
                git_status: { status: 'modified', staged: false }
            }
        )

        console.log(chalk.green(`✓ Analyzed: ${filePath}`));
    }

    reportUtil.saveSummary({});
}
