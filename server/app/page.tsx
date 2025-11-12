import React from 'react';
import Link from "next/link";
import {retrieveAnalyticData, retrieveFileAnalyticData, retrieveSummary} from "@/lib/analyzer-report";
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
    const report = retrieveAnalyticData();
    const summary = retrieveSummary();
    const arrayOfReports = Object.keys(report);
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
                        <div className="stat-number error">{summary.eslint?.total_errors || 'N/A'}</div>
                        <div>ESLint Errors</div>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-number warning">{summary.eslint?.total_warnings || 'N/A'}</div>
                        <div>ESLint Warnings</div>
                    </div>
                    <div className="stat-card success">
                        <div className="stat-number success">{summary.prettier?.formatted_files || 'N/A'}</div>
                        <div>Prettier Formatted</div>
                    </div>
                    <div className="stat-card info">
                        <div className="stat-number info">{summary.test?.tested_files || 'N/A'}</div>
                        <div>Valid Tests</div>
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="files-section">
                        <h2>Analyzed Files ({report.files?.length})</h2>
                        <div className="files-grid">
                            {arrayOfReports.map((file, index) => {
                                const fileReport = retrieveFileAnalyticData(report[file]);
                                return (
                                <Link key={index} href={`/compare?file=${report[file]}`}>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="file-path">{file}</CardTitle>
                                            <CardDescription>
                                                <div className="file-stats">
                                                    <span className="error-count">{fileReport.eslint_report?.errorCount || 'N/A'} errors</span>
                                                    <span className="warning-count">{fileReport.eslint_report?.warningCount || 'N/A'} warnings</span>
                                                </div>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="file-preview">
                                                <div className="preview-item">
                                                    <span className="preview-label">ESLint:</span>
                                                    <span className={fileReport.eslint_report?.errorCount && fileReport.eslint_report.errorCount > 0 ? 'preview-error' : 'preview-ok'}>
                                                    {fileReport.eslint_report?.errorCount || 'N/A'} errors, {fileReport.eslint_report?.warningCount || 'N/A'} warnings
                                                </span>
                                                </div>
                                                <div className="preview-item">
                                                    <span className="preview-label">Prettier:</span>
                                                        <span className={fileReport.prettier_report?.changes ? 'preview-changed' : 'preview-ok'}>
                                                        {fileReport.prettier_report?.changes ? 'Formatted' : 'No changes'}
                                                    </span>
                                                </div>
                                                {
                                                    fileReport.test_report?.unit
                                                        ? (
                                                            <div className="preview-item">
                                                                <span className="preview-label">Unit Tests:</span>
                                                                <span className={fileReport.test_report?.unit.isValid ? 'preview-ok' : fileReport.test_report?.unit?.path ? 'preview-warning' : 'preview-error'}>
                                                                    {fileReport.test_report?.unit.isValid ? 'Valid' : fileReport.test_report?.unit?.path ? 'Wrong name' : 'Missing'}
                                                                </span>
                                                            </div>
                                                        )
                                                        : null
                                                }
                                                {
                                                    fileReport.test_report?.e2e
                                                        ? (
                                                            <div className="preview-item">
                                                                <span className="preview-label">E2E Tests:</span>
                                                                <span className={fileReport.test_report?.e2e.isValid ? 'preview-ok' : fileReport.test_report?.e2e?.path ? 'preview-warning' : 'preview-error'}>
                                                                    {fileReport.test_report?.e2e.isValid ? 'Valid' : fileReport.test_report?.e2e?.path ? 'Wrong name' : 'Missing'}
                                                                </span>
                                                            </div>
                                                        )
                                                        : null
                                                }
                                                {
                                                    fileReport.test_report?.integration
                                                        ? (
                                                            <div className="preview-item">
                                                                <span className="preview-label">Component Tests:</span>
                                                                <span className={fileReport.test_report?.integration.isValid ? 'preview-ok' : fileReport.test_report?.integration?.path ? 'preview-warning' : 'preview-error'}>
                                                                    {fileReport.test_report?.integration.isValid ? 'Valid' : fileReport.test_report?.integration?.path ? 'Wrong name' : 'Missing'}
                                                                </span>
                                                            </div>
                                                        )
                                                        : null
                                                }
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )})}
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
