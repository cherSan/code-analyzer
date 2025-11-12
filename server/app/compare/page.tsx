import React from 'react';
import MonacoDiff from "@/components/monaco-diff.component";
import {retrieveFileAnalyticData} from "@/lib/analyzer-report";
import {FileReport} from "@/types/analyzer.types";

function FileComparison({
    original_file_content,
    linted_file_content,
    original_file_path,
    eslint_report,
    prettier_report,
}: FileReport) {
    return (
        <div className="comparison-container">
            <div className="comparison-header">
                <h1>🔍 File Comparison: {original_file_path}</h1>
                <div className="file-stats">
                    <div className="stat">
                        <span className="stat-label">ESLint:</span>
                        <span className={`stat-value ${eslint_report?.errorCount && eslint_report?.errorCount > 0 ? 'error' : 'success'}`}>
                            {eslint_report?.errorCount} errors, {eslint_report?.warningCount} warnings
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Prettier:</span>
                        <span className={`stat-value ${prettier_report?.changes ? 'changed' : 'unchanged'}`}>
                            {prettier_report?.changes ? 'Formatted' : 'No changes'}
                        </span>
                    </div>
                </div>
            </div>

            <MonacoDiff
                originalContent={original_file_content || ''}
                lintedContent={linted_file_content || ''}
                fileName={original_file_path || ''}
            />

            <div className="changes-summary">
                <h3>Changes Summary</h3>
                <div className="changes-grid">
                    <div className="change-item">
                        <span className="change-label">Original:</span>
                        <span className="change-value">{original_file_content?.length} characters</span>
                    </div>
                    <div className="change-item">
                        <span className="change-label">Linted:</span>
                        <span className="change-value">{linted_file_content?.length} characters</span>
                    </div>
                    <div className="change-item">
                        <span className="change-label">ESLint:</span>
                        <span className={`change-value ${eslint_report?.fixed ? 'changed' : 'unchanged'}`}>
                            {eslint_report?.fixed ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div className="change-item">
                        <span className="change-label">Prettier:</span>
                        <span className={`change-value ${prettier_report?.changes ? 'changed' : 'unchanged'}`}>
                            {prettier_report?.changes ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="changes-summary">
                <h3 className="error">Errors</h3>
                {
                    eslint_report?.messages?.length === 0
                        ? <p>No ESLint errors found.</p>
                        : (
                            <ul className="error-list">
                                {eslint_report?.messages.map((msg, index) => (
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
    if (!params.file) return null;
    const data = retrieveFileAnalyticData(params.file);

    if (!data) {
        return (
            <div className="container">
                <div className="header">
                    <h1>🔍 File Comparison</h1>
                    <p>Failed to load comparison data for {params.file}.</p>
                </div>
            </div>
        );
    }


    return  <FileComparison {...data} />;
}
