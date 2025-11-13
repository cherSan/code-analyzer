import chalk from 'chalk';
import {readFileSync} from "fs-extra";
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

    let esLintTotalErrors = 0;
    let esLintTotalWarnings = 0;
    let esLintFixableErrors = 0;
    let esLintFixableWarnings = 0;

    let formatedFiles = 0;

    let testedFiles = 0;
    let missedTestedFiles = 0;
    let invalidTestedFiles = 0;
    let totalCoverage = 0;

    for (const filePath of typescriptFiles) {
        console.log(chalk.gray(`\n🔍 Analyzing: ${filePath}`));
        const originalContent = readFileSync(filePath, 'utf8');
        const testReport = await testFileUtil.checkTestFile(filePath);
        const eslintReport = await lintUtil.eslintReport(filePath);
        const prettierReport = await lintUtil.prettierReport(filePath);

        esLintTotalErrors += eslintReport.errorCount || 0;
        esLintTotalWarnings += eslintReport.warningCount || 0;
        esLintFixableErrors += eslintReport.fixableErrorCount || 0;
        esLintFixableWarnings += eslintReport.fixableWarningCount || 0;

        if (testReport.unit && testReport.unit.exist) {
            testedFiles++;
            totalCoverage += 1;
        } else if (testReport.unit && !testReport.unit.exist) {
            invalidTestedFiles++;
        } else {
            missedTestedFiles++;
        }

        if (prettierReport.formatted) formatedFiles++;

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

    reportUtil.saveSummary({
        eslint: {
            total_errors: esLintTotalErrors,
            total_warnings: esLintTotalWarnings,
            fixable_errors: esLintFixableErrors,
            fixable_warnings: esLintFixableWarnings,
        },
        prettier: {
            formatted_files: formatedFiles,
        },
        test: {
            tested_files: testedFiles,
            missed_tested_files: missedTestedFiles,
            invalid_tested_files: invalidTestedFiles,
            code_coverage: testedFiles ? totalCoverage / testedFiles : 0,
        },
    });
}
