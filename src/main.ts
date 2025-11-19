import chalk from 'chalk';
import { readFileSync } from "fs-extra";
import { GitUtil } from './utils/git.util';
import { ReportUtil } from './utils/report.util';
import { LintUtil } from './utils/lint.util';
import { TestFileUtil } from './utils/test-file.util';
import { loadProjectConfig } from "./config";

export async function main(): Promise<void> {
    console.log(chalk.blue('🚀 Code Analyzer started!'));

    const config = loadProjectConfig();

    const gitUtil = new GitUtil();
    const reportUtil = new ReportUtil();
    const lintUtil = new LintUtil(config);
    const testFileUtil = new TestFileUtil(config);

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
    let totalCoveragePct = 0;
    let filesCounted = 0;
    let totalTests = 0;
    let failedTests = 0;

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
            if (testReport.unit.report) {
                totalTests += testReport.unit.report.totalTests || 0;
                failedTests += testReport.unit.report.testFailed || 0;
            }
        } else if (testReport.unit && !testReport.unit.exist) {
            invalidTestedFiles++;
        } else {
            missedTestedFiles++;
        }
        let fileCoveragePct = 0;
        if (testReport.unit?.report?.coverage) {
            const coverage = testReport.unit.report.coverage;
            const fileCov = coverage[filePath] || coverage[Object.keys(coverage)[0]]; // fallback на первый файл
            if (fileCov) {
                const pctValues = [
                    fileCov.statements?.pct ?? 0,
                    fileCov.lines?.pct ?? 0,
                    fileCov.functions?.pct ?? 0,
                    fileCov.branches?.pct ?? 0
                ];
                fileCoveragePct = pctValues.reduce((a, b) => a + b, 0) / pctValues.length;
            }
        } else {
            fileCoveragePct = 0;
        }

        totalCoveragePct += fileCoveragePct;
        filesCounted++;

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
    const averageCoverage = filesCounted ? +(totalCoveragePct / filesCounted).toFixed(2) : 0;
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
            code_coverage: averageCoverage,
            failed_tests: failedTests,
            total_tests: totalTests
        },
    });
}
