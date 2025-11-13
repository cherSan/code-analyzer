import React from 'react';
import {retrieveFileAnalyticData} from "@/lib/analyzer-report";
import {FileReport, TestResultSummary, TestCoverageSummary} from "@/types/analyzer.types";
import {Header, Text} from "@/components/ui/typography";
import {Separator} from "@/components/ui/separator";

function TestCoverage({ original_file_path, test_report }: FileReport) {
    const unitReport = test_report?.unit?.report;

    const coverage: TestCoverageSummary | undefined = unitReport?.coverage
        ? unitReport.coverage[original_file_path || Object.keys(unitReport.coverage)[0]]
        : undefined;

    const testSummary = unitReport?.testSummary || {};

    return (
        <div className="comparison-container">
            <div className="comparison-header">
                <h1>🧪 File Test & Coverage Report: {original_file_path}</h1>
                <div className="file-stats">
                    {unitReport ? (
                        <>
                            <div className="stat">
                                <span className="stat-label">Total Tests:</span>
                                <span className={`stat-value ${unitReport.testFailed > 0 ? 'error' : 'success'}`}>
                                    {unitReport.totalTests} tests
                                </span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Passed:</span>
                                <span className="stat-value success">{unitReport.testPassed}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Failed:</span>
                                <span className="stat-value error">{unitReport.testFailed}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Coverage:</span>
                                <span className="stat-value success">
                                    {coverage
                                        ? `${coverage.lines?.pct ?? 0}% lines, ${coverage.statements?.pct ?? 0}% statements, ${coverage.functions?.pct ?? 0}% functions, ${coverage.branches?.pct ?? 0}% branches`
                                        : "0% (no coverage)"}
                                </span>
                            </div>
                        </>
                    ) : (
                        <Text variant="warning">No test report found for this file.</Text>
                    )}
                </div>
            </div>

            {unitReport && Object.entries(testSummary).map(([suiteName, tests]) => (
                <div key={suiteName} className="test-suite">
                    <Header as="h4" variant="info">{suiteName}</Header>
                    {Object.entries(tests).length === 0 ? (
                        <Text>No tests found.</Text>
                    ) : (
                        <ul className="test-list">
                            {Object.entries(tests).map(([testName, test]: [string, TestResultSummary]) => (
                                <li key={testName} className={`test-item ${test.status} flex flex-col py-2`}>
                                    <Text variant={test.status === 'failed' ? 'error' : 'success'}>
                                        {testName} — {test.status.toUpperCase()}
                                    </Text>
                                    {test.error && (
                                        <Text variant="warning" className="test-error">{test.error}</Text>
                                    )}
                                    <Separator />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
}

interface ComparePageProps {
    searchParams: Promise<{ file?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
    const params = await searchParams;
    if (!params.file) return null;

    const data: FileReport | undefined = retrieveFileAnalyticData(params.file);

    if (!data) {
        return (
            <div className="container">
                <div className="header">
                    <h1>🧪 File Test & Coverage Report</h1>
                    <p>Failed to load test and coverage data for {params.file}.</p>
                </div>
            </div>
        );
    }

    return <TestCoverage {...data} />;
}
