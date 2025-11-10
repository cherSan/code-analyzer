import React from 'react';
import MonacoDiff from "@/components/monaco-diff.component";
import {getFileContent, retrieveFileAnalyticData} from "@/lib/analyzer-report";
import {FileAnalysis} from "@/types/analyzer.types";

function FileComparison({
                            originalContent,
                            lintingContent,
                            originalPath,
                            eslintReport,
                            prettierReport
                        }: FileAnalysis & { originalContent: string; lintingContent: string }) {
    return (
        <div className="comparison-container">
            <div className="comparison-header">
                <h1>🔍 File Comparison: {originalPath}</h1>
                <div className="file-stats">
                    <div className="stat">
                        <span className="stat-label">ESLint:</span>
                        <span className={`stat-value ${eslintReport.errorCount > 0 ? 'error' : 'success'}`}>
                            {eslintReport.errorCount} errors, {eslintReport.warningCount} warnings
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Prettier:</span>
                        <span className={`stat-value ${prettierReport.changes ? 'changed' : 'unchanged'}`}>
                            {prettierReport.changes ? 'Formatted' : 'No changes'}
                        </span>
                    </div>
                </div>
            </div>

            <MonacoDiff
                originalContent={originalContent}
                lintedContent={lintingContent}
                fileName={originalPath}
            />

            <div className="changes-summary">
                <h3>Changes Summary</h3>
                <div className="changes-grid">
                    <div className="change-item">
                        <span className="change-label">Original:</span>
                        <span className="change-value">{originalContent.length} characters</span>
                    </div>
                    <div className="change-item">
                        <span className="change-label">Linted:</span>
                        <span className="change-value">{lintingContent.length} characters</span>
                    </div>
                    <div className="change-item">
                        <span className="change-label">ESLint:</span>
                        <span className={`change-value ${eslintReport.fixed ? 'changed' : 'unchanged'}`}>
                            {eslintReport.fixed ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div className="change-item">
                        <span className="change-label">Prettier:</span>
                        <span className={`change-value ${prettierReport.changes ? 'changed' : 'unchanged'}`}>
                            {prettierReport.changes ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="changes-summary">
                <h3 className="error">Errors</h3>
                {
                    eslintReport?.messages?.length === 0
                        ? <p>No ESLint errors found.</p>
                        : (
                            <ul className="error-list">
                                {eslintReport.messages.map((msg, index) => (
                                    <li key={index} className="error-item">
                                        <span className="error-location">Line {msg.line}, Col {msg.column}:</span>
                                        <span className="error-message">{msg.message} {msg.ruleId && `(Rule: ${msg.ruleId})`}</span>
                                    </li>
                                ))}
                            </ul>
                        )
                }
            </div>
        </div>
    );
}

interface ComparePageProps {
    searchParams: Promise<{ file?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
    const params = await searchParams;
    const fileIndex = params.file ? parseInt(params.file) : -1;
    const data = await retrieveFileAnalyticData(fileIndex);
    const originalContent = getFileContent(data?.originalPath);
    const lintingContent = getFileContent(data?.lintingCopyPath);

    if (!data || !originalContent || !lintingContent) {
        return (
            <div className="container">
                <div className="header">
                    <h1>🔍 File Comparison</h1>
                    <p>Failed to load comparison data for file index {fileIndex}.</p>
                </div>
            </div>
        );
    }


    return (
        <FileComparison
            {...data}
            originalContent={originalContent}
            lintingContent={lintingContent}
        />
    );
}