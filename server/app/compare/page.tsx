import React from 'react';
import * as fs from 'fs-extra';
import * as path from 'path';
import MonacoDiff from "@/components/monaco-diff.component";

interface FileComparisonProps {
    originalContent: string;
    lintedContent: string;
    fileName: string;
    eslintReport: any;
    prettierReport: any;
}

function FileComparison({
                            originalContent,
                            lintedContent,
                            fileName,
                            eslintReport,
                            prettierReport
                        }: FileComparisonProps) {
    return (
        <div className="comparison-container">
            <div className="comparison-header">
                <h1>🔍 File Comparison: {fileName}</h1>
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

            <div className="editor-container">
                <MonacoDiff
                    originalContent={originalContent}
                    lintedContent={lintedContent}
                    fileName={fileName}
                />
            </div>

            <div className="changes-summary">
                <h3>Changes Summary</h3>
                <div className="changes-grid">
                    <div className="change-item">
                        <span className="change-label">Original File:</span>
                        <span className="change-value">{originalContent.length} characters</span>
                    </div>
                    <div className="change-item">
                        <span className="change-label">Linted File:</span>
                        <span className="change-value">{lintedContent.length} characters</span>
                    </div>
                    <div className="change-item">
                        <span className="change-label">ESLint Fixed:</span>
                        <span className={`change-value ${eslintReport.fixed ? 'fixed' : 'no-fix'}`}>
                            {eslintReport.fixed ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div className="change-item">
                        <span className="change-label">Prettier Changes:</span>
                        <span className={`change-value ${prettierReport.changes ? 'changed' : 'unchanged'}`}>
                            {prettierReport.changes ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

async function loadComparisonData(fileIndex: number): Promise<FileComparisonProps | null> {
    try {
        console.log(fileIndex)
        const reportPath = process.env.REPORT_PATH;
        if (!reportPath) {
            console.log('REPORT_PATH not set');
            return null;
        }

        console.log('Loading comparison data from:', reportPath);

        if (await fs.pathExists(reportPath)) {
            const reportData = await fs.readJson(reportPath);
            const file = reportData.files[fileIndex];

            if (file) {
                const analyzerDir = path.dirname(reportPath);
                const originalContent = await fs.readFile(
                    path.join(analyzerDir, file.originalCopyPath),
                    'utf8'
                );
                const lintedContent = await fs.readFile(
                    path.join(analyzerDir, file.lintingCopyPath),
                    'utf8'
                );

                console.log(`Loaded file: ${file.originalPath}`);

                return {
                    originalContent,
                    lintedContent,
                    fileName: file.originalPath,
                    eslintReport: file.eslintReport,
                    prettierReport: file.prettierReport
                };
            } else {
                console.log(`File index ${fileIndex} not found in report`);
            }
        } else {
            console.log('Report file not found at:', reportPath);
        }

        return null;
    } catch (error) {
        console.error('Error loading comparison data:', error);
        return null;
    }
}

interface ComparePageProps {
    searchParams: Promise<{ file?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
    // Ожидаем searchParams так как это Promise
    const params = await searchParams;
    const fileIndex = params.file ? parseInt(params.file) : -1;

    if (fileIndex === -1) {
        return (
            <div className="container">
                <div className="header">
                    <h1>🔍 File Comparison</h1>
                    <p>No file specified. Please select a file from the dashboard.</p>
                </div>
            </div>
        );
    }

    const comparisonData = await loadComparisonData(fileIndex);

    if (!comparisonData) {
        return (
            <div className="container">
                <div className="header">
                    <h1>🔍 File Comparison</h1>
                    <p>Failed to load comparison data for file index {fileIndex}.</p>
                </div>
            </div>
        );
    }

    return <FileComparison {...comparisonData} />;
}