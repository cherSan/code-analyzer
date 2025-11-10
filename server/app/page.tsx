import React from 'react';
import Link from "next/link";
import {retrieveAnalyticData} from "@/lib/analyzer-report";
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

function CommitForm() {
    return (
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
        </form>
    );
}

export default async function AnalyzerDashboard() {
    const report = await retrieveAnalyticData();
    if (!report) {
        return (
            <div className="container">
                <div className="header">
                    <h1>🚀 Code Analyzer Dashboard!!</h1>
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
                                <Link key={index} href={`/compare?file=${index}`}>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="file-path">{file.originalPath}</CardTitle>
                                            <CardDescription>
                                                <div className="file-stats">
                                                    <span className="error-count">{file.eslintReport.errorCount} errors</span>
                                                    <span className="warning-count">{file.eslintReport.warningCount} warnings</span>
                                                </div>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
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
                                                    <span className="preview-label">Unit Tests:</span>
                                                    <span className={file.tests.unit?.isValid ? 'preview-ok' : file.tests.unit?.hasTestFile ? 'preview-warning' : 'preview-error'}>
                                                        {file.tests.unit?.isValid ? 'Valid' : file.tests.unit?.hasTestFile ? 'Wrong name' : 'Missing'}
                                                    </span>
                                                </div>
                                                {
                                                    file.tests.integration
                                                        ? (
                                                            <div className="preview-item">
                                                                <span className="preview-label">Integration Tests:</span>
                                                                <span className={file.tests.integration?.isValid ? 'preview-ok' : file.tests.integration?.hasTestFile ? 'preview-warning' : 'preview-error'}>
                                                                    {file.tests.integration?.isValid ? 'Valid' : file.tests.integration?.hasTestFile ? 'Wrong name' : 'Missing'}
                                                                </span>
                                                            </div>
                                                        )
                                                        : null
                                                }
                                                {
                                                    file.tests.e2e
                                                        ? (
                                                            <div className="preview-item">
                                                                <span className="preview-label">Integration Tests:</span>
                                                                <span className={file.tests.e2e?.isValid ? 'preview-ok' : file.tests.e2e?.hasTestFile ? 'preview-warning' : 'preview-error'}>
                                                                    {file.tests.e2e?.isValid ? 'Valid' : file.tests.e2e?.hasTestFile ? 'Wrong name' : 'Missing'}
                                                                </span>
                                                            </div>
                                                        )
                                                        : null
                                                }
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Prepare Commit</CardTitle>
                            <CardAction>📝 Create Commit</CardAction>
                        </CardHeader>
                        <CardContent>
                            <CommitForm />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    return <ClientDashboard />;
}