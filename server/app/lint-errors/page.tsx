import React from 'react';
import MonacoDiff from "@/components/monaco-diff.component";
import {retrieveFileAnalyticData} from "@/lib/analyzer-report";
import {FileReport} from "@/types/analyzer.types";
import {Header, Text} from "@/components/ui/typography";

function LintErrors({
                            original_file_path,
                            eslint_report,
                        }: FileReport) {
    return (
        <div className="comparison-container">
            <div className="comparison-header">
                <h1>🔍 File ESLinter Errors: {original_file_path}</h1>
                <div className="file-stats">
                    <div className="stat">
                        <span className="stat-label">ESLint:</span>
                        <span className={`stat-value ${eslint_report?.errorCount && eslint_report?.errorCount > 0 ? 'error' : 'success'}`}>
                            {eslint_report?.errorCount} errors, {eslint_report?.warningCount} warnings
                        </span>
                    </div>
                </div>
            </div>
            <div className="changes-summary">
                <Header as="h4" variant="error">Errors</Header>
                {
                    eslint_report?.messages?.length === 0
                        ? <p>No ESLint errors found.</p>
                        : (
                            <ul className="error-list">
                                {eslint_report?.messages.map((msg, index) => (
                                    <li key={index} className="error-item">
                                        <Text variant="info">Line {msg.line}, Col {msg.column}:</Text>
                                        <Text variant="error">{msg.message} {msg.ruleId && `(Rule: ${msg.ruleId})`}</Text>
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


    return  <LintErrors {...data} />;
}
