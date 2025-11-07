import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AnalysisReport, FileAnalysis } from '../types/analyzer.types';
import chalk from 'chalk';

export class ReportUtil {
    private readonly report: AnalysisReport;
    private readonly reportPath: string;

    constructor() {
        this.reportPath = path.join(process.cwd(), '.code-analyzer', 'report.json');
        this.report = {
            timestamp: new Date().toISOString(),
            totalFiles: 0,
            totalErrors: 0,
            totalWarnings: 0,
            files: [],
            summary: {
                eslint: { totalErrors: 0, totalWarnings: 0, fixableErrors: 0, fixableWarnings: 0 },
                prettier: { formattedFiles: 0, totalFiles: 0 },
                tests: { totalFiles: 0, hasTestFiles: 0, missingTestFiles: 0, invalidTestFiles: 0 }
            }
        };
    }

    /**
     * Generate simple UUID filename
     */
    generateUniqueFilename(originalPath: string, suffix: string): string {
        const ext = path.extname(originalPath);
        const uniqueId = uuidv4();
        return `${suffix}_${uniqueId}${ext}`;
    }

    /**
     * Add file analysis to report
     */
    addFileAnalysis(analysis: Omit<FileAnalysis, 'originalContent' | 'lintingContent'>): void {
        this.report.files.push(analysis as FileAnalysis);
        this.report.totalFiles++;

        // Update ESLint summary
        this.report.summary.eslint.totalErrors += analysis.eslintReport.errorCount;
        this.report.summary.eslint.totalWarnings += analysis.eslintReport.warningCount;
        this.report.summary.eslint.fixableErrors += analysis.eslintReport.fixableErrorCount;
        this.report.summary.eslint.fixableWarnings += analysis.eslintReport.fixableWarningCount;

        // Update Prettier summary
        if (analysis.prettierReport.formatted) {
            this.report.summary.prettier.formattedFiles++;
        }
        this.report.summary.prettier.totalFiles++;

        // Update Test summary
        this.report.summary.tests.totalFiles++;
        if (analysis.testFileCheck.isValid) {
            this.report.summary.tests.hasTestFiles++;
        } else if (analysis.testFileCheck.hasTestFile) {
            this.report.summary.tests.invalidTestFiles++;
        } else {
            this.report.summary.tests.missingTestFiles++;
        }
    }

    /**
     * Save report to file
     */
    async saveReport(): Promise<void> {
        await fs.ensureDir(path.dirname(this.reportPath));
        await fs.writeJson(this.reportPath, this.report, { spaces: 2 });
        console.log(chalk.green(`📊 Analysis report saved to: ${this.reportPath}`));
    }

    /**
     * Get report data
     */
    getReport(): AnalysisReport {
        return this.report;
    }

    /**
     * Get report file path
     */
    getReportPath(): string {
        return this.reportPath;
    }
}