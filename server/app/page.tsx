import React from 'react';
import * as fs from 'fs-extra';

interface LintIssue {
    line: number;
    column: number;
    ruleId: string | null;
    message: string;
    severity: number;
    nodeType: string | null;
    source: string | null;
    endLine?: number;
    endColumn?: number;
}

interface TestFileCheck {
    hasTestFile: boolean;
    expectedTestPath: string;
    actualTestPath?: string;
    isValid: boolean;
    error?: string;
}

interface FileAnalysis {
    originalPath: string;
    originalCopyPath: string;
    lintingCopyPath: string;
    eslintReport: {
        errorCount: number;
        warningCount: number;
        fixableErrorCount: number;
        fixableWarningCount: number;
        messages: LintIssue[];
        fixed: boolean;
        output?: string;
    };
    prettierReport: {
        formatted: boolean;
        changes: boolean;
        input: string;
        output: string;
    };
    gitStatus: {
        status: string;
        staged: boolean;
    };
    testFileCheck: TestFileCheck;
}

interface AnalysisReport {
    timestamp: string;
    totalFiles: number;
    totalErrors: number;
    totalWarnings: number;
    files: FileAnalysis[];
    summary: {
        eslint: {
            totalErrors: number;
            totalWarnings: number;
            fixableErrors: number;
            fixableWarnings: number;
        };
        prettier: {
            formattedFiles: number;
            totalFiles: number;
        };
        tests: {
            totalFiles: number;
            hasTestFiles: number;
            missingTestFiles: number;
            invalidTestFiles: number;
        };
    };
}

async function loadAnalysis(): Promise<AnalysisReport | null> {
    try {
        const reportPath = process.env.REPORT_PATH;

        if (!reportPath) {
            console.log('REPORT_PATH environment variable not set');
            return null;
        }

        console.log('Loading report from:', reportPath);

        if (await fs.pathExists(reportPath)) {
            const reportData = await fs.readJson(reportPath);
            console.log('Report loaded successfully');
            return reportData as AnalysisReport;
        }

        console.log('Report file not found at specified path');
        return null;
    } catch (error) {
        console.error('Error loading analysis:', error);
        return null;
    }
}

function CommitForm({ onCommit }: { onCommit: (title: string, description: string) => void }) {
    return (
        <div className="commit-form">
            <h3>Prepare Commit</h3>
            <form>
                <div className="form-group">
                    <label>Commit Title *</label>
                    <input
                        type="text"
                        defaultValue={''}
                        placeholder="Add feature X"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Commit Description</label>
                    <textarea
                        defaultValue={''}
                        placeholder="Detailed description of changes..."
                        rows={3}
                    />
                </div>
                <button type="submit" className="commit-button">
                    📝 Create Commit
                </button>
            </form>
        </div>
    );
}

function FileDetails({ file, onClose }: { file: FileAnalysis; onClose: () => void }) {
    return (
        <div className="file-details-overlay">
            <div className="file-details-modal">
                <div className="file-details-header">
                    <h2>{file.originalPath}</h2>
                    <button onClick={onClose} className="close-button">×</button>
                </div>

                <div className="file-details-content">
                    <div className="file-meta">
                        <div className="meta-item">
                            <strong>ESLint:</strong> {file.eslintReport.errorCount} errors, {file.eslintReport.warningCount} warnings
                        </div>
                        <div className="meta-item">
                            <strong>Prettier:</strong> {file.prettierReport.changes ? 'Formatted' : 'No changes'}
                        </div>
                        <div className="meta-item">
                            <strong>Test File:</strong>
                            <span className={file.testFileCheck.isValid ? 'status-valid' : file.testFileCheck.hasTestFile ? 'status-warning' : 'status-error'}>
                                {file.testFileCheck.isValid ? '✓ Valid' : file.testFileCheck.hasTestFile ? '⚠ Wrong name' : '✗ Missing'}
                            </span>
                        </div>
                    </div>

                    <div className="issues-section">
                        <h3>ESLint Issues</h3>
                        {file.eslintReport.messages.length === 0 ? (
                            <p className="no-issues">No issues found ✓</p>
                        ) : (
                            file.eslintReport.messages.map((issue, index) => (
                                <div key={index} className={`issue-detail ${issue.severity === 2 ? 'error' : 'warning'}`}>
                                    <span className="issue-icon">
                                        {issue.severity === 2 ? '✗' : '⚠'}
                                    </span>
                                    <span className="issue-location">
                                        Line {issue.line}:{issue.column}
                                    </span>
                                    <span className="issue-message">{issue.message}</span>
                                    {issue.ruleId && (
                                        <span className="issue-rule">{issue.ruleId}</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {file.testFileCheck.error && (
                        <div className="test-file-warning">
                            <strong>Test File Issue:</strong> {file.testFileCheck.error}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default async function AnalyzerDashboard() {
    const report = await loadAnalysis();

    if (!report) {
        return (
            <div className="container">
                <div className="header">
                    <h1>🚀 Code Analyzer Dashboard</h1>
                    <p>No analysis report found. Run code-analyzer first.</p>
                </div>
            </div>
        );
    }

    const ClientDashboard = () => {
        const handleCommit = (title: string, description: string) => {
            const fullMessage = description ? `${title}\n\n${description}` : title;
            // Here you would integrate with git commit API
            console.log('Commit message:', fullMessage);
        };

        return (
            <div className="container">
                <div className="header">
                    <h1>🚀 Code Analyzer Dashboard</h1>
                    <p>Review your code changes before Merge Request</p>
                </div>

                <div className="stats">
                    <div className="stat-card error">
                        <div className="stat-number error">{report.summary.eslint.totalErrors}</div>
                        <div>ESLint Errors</div>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-number warning">{report.summary.eslint.totalWarnings}</div>
                        <div>ESLint Warnings</div>
                    </div>
                    <div className="stat-card success">
                        <div className="stat-number success">{report.summary.prettier.formattedFiles}</div>
                        <div>Prettier Formatted</div>
                    </div>
                    <div className="stat-card info">
                        <div className="stat-number info">{report.summary.tests.hasTestFiles}</div>
                        <div>Valid Tests</div>
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="files-section">
                        <h2>Analyzed Files ({report.files.length})</h2>
                        <div className="files-grid">
                            {report.files.map((file, index) => (
                                <div
                                    key={index}
                                    className="file-card"
                                >
                                    <div className="file-header">
                                        <div className="file-path">{file.originalPath}</div>
                                        <div className="file-stats">
                                            {file.eslintReport.errorCount > 0 && (
                                                <span className="error-count">{file.eslintReport.errorCount} errors</span>
                                            )}
                                            {file.eslintReport.warningCount > 0 && (
                                                <span className="warning-count">{file.eslintReport.warningCount} warnings</span>
                                            )}
                                            <span className={`test-status ${file.testFileCheck.isValid ? 'test-valid' : file.testFileCheck.hasTestFile ? 'test-warning' : 'test-error'}`}>
                                                {file.testFileCheck.isValid ? '✓' : file.testFileCheck.hasTestFile ? '⚠' : '✗'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="file-preview">
                                        <div className="preview-item">
                                            <span className="preview-label">ESLint:</span>
                                            <span className={file.eslintReport.errorCount > 0 ? 'preview-error' : 'preview-ok'}>
                                                {file.eslintReport.errorCount} errors, {file.eslintReport.warningCount} warnings
                                            </span>
                                        </div>
                                        <div className="preview-item">
                                            <span className="preview-label">Prettier:</span>
                                            <span className={file.prettierReport.changes ? 'preview-changed' : 'preview-ok'}>
                                                {file.prettierReport.changes ? 'Formatted' : 'No changes'}
                                            </span>
                                        </div>
                                        <div className="preview-item">
                                            <span className="preview-label">Tests:</span>
                                            <span className={file.testFileCheck.isValid ? 'preview-ok' : file.testFileCheck.hasTestFile ? 'preview-warning' : 'preview-error'}>
                                                {file.testFileCheck.isValid ? 'Valid' : file.testFileCheck.hasTestFile ? 'Wrong name' : 'Missing'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="file-actions">
                                        <a
                                            href={`/compare?file=${index}`}
                                            className="compare-button"
                                        >
                                            🔍 Compare
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="commit-section">
                        <CommitForm onCommit={handleCommit} />
                    </div>
                </div>
            </div>
        );
    };

    return <ClientDashboard />;
}