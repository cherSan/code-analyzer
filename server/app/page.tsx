import React from 'react';
import * as fs from 'fs-extra';
import * as path from 'path';

interface LintIssue {
    line: number;
    column: number;
    ruleId: string;
    message: string;
    severity: number;
}

interface FileAnalysis {
    filePath: string;
    errorCount: number;
    warningCount: number;
    issues: LintIssue[];
    content?: string;
}

async function loadAnalysis(): Promise<FileAnalysis[]> {
    try {
        const analyzerDir = path.join(process.cwd(), '.code-analyzer');
        console.log('>>>>', analyzerDir)

        if (await fs.pathExists(analyzerDir)) {
            return [
                {
                    filePath: 'src/components/button.component.tsx',
                    errorCount: 2,
                    warningCount: 3,
                    issues: [
                        { line: 10, column: 5, ruleId: 'no-debugger', message: 'Unexpected debugger statement', severity: 2 },
                        { line: 15, column: 12, ruleId: 'no-console', message: 'Unexpected console statement', severity: 1 },
                        { line: 20, column: 8, ruleId: 'no-unused-vars', message: 'unusedVariable is defined but never used', severity: 1 }
                    ]
                },
                {
                    filePath: 'src/hooks/use-counter.hook.ts',
                    errorCount: 1,
                    warningCount: 2,
                    issues: [
                        { line: 8, column: 3, ruleId: 'no-debugger', message: 'Unexpected debugger statement', severity: 2 },
                        { line: 12, column: 5, ruleId: 'no-console', message: 'Unexpected console statement', severity: 1 }
                    ]
                }
            ];
        }

        return [];
    } catch (error) {
        console.error('Error loading analysis:', error);
        return [];
    }
}

export default async function AnalyzerDashboard() {
    const analysis = await loadAnalysis();
    const totalErrors = analysis.reduce((sum, file) => sum + file.errorCount, 0);
    const totalWarnings = analysis.reduce((sum, file) => sum + file.warningCount, 0);

    return (
        <div className="container">
            <div className="header">
                <h1>🚀 Code Analyzer Dashboard</h1>
                <p>Review your code changes before Merge Request</p>
            </div>

            <div className="stats">
                <div className="stat-card error">
                    <div className="stat-number error">{totalErrors}</div>
                    <div>Errors</div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-number warning">{totalWarnings}</div>
                    <div>Warnings</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-number success">{analysis.length}</div>
                    <div>Files Analyzed</div>
                </div>
            </div>

            <div className="files-grid">
                {analysis.map((file, index) => (
                    <div key={index} className="file-card">
                        <div className="file-header">
                            <div className="file-path">{file.filePath}</div>
                            <div className="file-stats">
                                {file.errorCount > 0 && (
                                    <span className="error-count">{file.errorCount} errors</span>
                                )}
                                {file.warningCount > 0 && (
                                    <span className="warning-count">{file.warningCount} warnings</span>
                                )}
                            </div>
                        </div>

                        <div className="issues-list">
                            {file.issues.slice(0, 3).map((issue, issueIndex) => (
                                <div
                                    key={issueIndex}
                                    className={`issue ${issue.severity === 2 ? 'error' : 'warning'}`}
                                >
                  <span className="issue-icon">
                    {issue.severity === 2 ? '✗' : '⚠'}
                  </span>
                                    <span className="issue-location">
                    Line {issue.line}:{issue.column}
                  </span>
                                    <span>{issue.message}</span>
                                </div>
                            ))}
                            {file.issues.length > 3 && (
                                <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '5px' }}>
                                    +{file.issues.length - 3} more issues...
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}