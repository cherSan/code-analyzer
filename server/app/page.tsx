import React from 'react';
import Link from "next/link";
import {retrieveAnalyticData, retrieveFileAnalyticData, retrieveSummary} from "@/lib/analyzer-report";
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Header, Text} from "@/components/ui/typography";
import {Item, ItemActions, ItemContent, ItemMedia, ItemTitle} from "@/components/ui/item";
import {BadgeCheckIcon, ChevronRightIcon, GitCompareArrows} from "lucide-react";

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
            console.log('Commit message:', fullMessage);
        };

        return (
            <div className="container">
                <div className="header">
                    <h1>🚀 Code Analyzer Dashboard</h1>
                    <p>Review your code changes before Merge Request</p>
                </div>

                <div className="stats">
                    <Card>
                        <CardContent className="justify-center items-center">
                            <Header as={'h2'} variant={'error'}>{summary.eslint?.total_errors}</Header>
                            <Text>ESLint Errors</Text>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="justify-center items-center">
                            <Header as={'h2'} variant={'warning'}>{summary.eslint?.total_warnings}</Header>
                            <Text>ESLint Warnings</Text>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="justify-center items-center">
                            <Header as={'h2'} variant={'success'}>{summary.prettier?.formatted_files}</Header>
                            <Text>Prettier Formatted</Text>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="justify-center items-center">
                            <Header as={'h2'} variant={'info'}>{summary.test?.total_tests}</Header>
                            <Text>Total Unit Tests</Text>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="justify-center items-center">
                            <Header as={'h2'} variant={'success'}>{summary.test?.code_coverage}</Header>
                            <Text>Average Unit Tests Coverage</Text>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="justify-center items-center">
                            <Header as={'h2'} variant={'error'}>{summary.test?.failed_tests}</Header>
                            <Text>Fail Unit Tests</Text>
                        </CardContent>
                    </Card>
                </div>

                <div className="dashboard-content">
                    <div className="files-section">
                        <div className="files-grid">
                            {arrayOfReports.map((file, index) => {
                                const fileReport = retrieveFileAnalyticData(report[file]);
                                return (
                                    <Card key={file}>
                                        <CardHeader>
                                            <CardTitle className="file-path">{file}</CardTitle>
                                            <CardDescription>
                                                <div className="preview-item">
                                                    <Text className="preview-label">Prettier:</Text>
                                                    <Text className={fileReport.prettier_report?.changes ? 'preview-changed' : 'preview-ok'}>
                                                        {fileReport.prettier_report?.changes ? 'Formatted' : 'No changes'}
                                                    </Text>
                                                </div>
                                                {
                                                    fileReport.test_report?.unit
                                                        ? (
                                                            <div className="preview-item">
                                                                <span className="preview-label">Unit Tests:</span>
                                                                <span className={fileReport.test_report?.unit.exist ? 'preview-ok' : fileReport.test_report?.unit?.path ? 'preview-warning' : 'preview-error'}>
                                                                    {fileReport.test_report?.unit.exist ? 'Exist' : 'Missing'}
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
                                                                <span className={fileReport.test_report?.e2e.exist ? 'preview-ok' : fileReport.test_report?.e2e?.path ? 'preview-warning' : 'preview-error'}>
                                                                    {fileReport.test_report?.e2e.exist ? 'Exist' : 'Missing'}
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
                                                                <span className={fileReport.test_report?.integration.exist ? 'preview-ok' : fileReport.test_report?.integration?.path ? 'preview-warning' : 'preview-error'}>
                                                                    {fileReport.test_report?.integration.exist ? 'Exist' : 'Missing'}
                                                                </span>
                                                            </div>
                                                        )
                                                        : null
                                                }
                                            </CardDescription>
                                            <CardAction className="flex gap-2 flex-col">
                                                <Item variant="outline" size="sm" asChild>
                                                    <Link key={index} href={`/compare?file=${report[file]}`}>
                                                            <GitCompareArrows className="size-5" />
                                                            <ItemTitle>Compare Changes</ItemTitle>
                                                            <ChevronRightIcon className="size-4" />
                                                    </Link>
                                                </Item>
                                                <Item variant="outline" size="sm" asChild>
                                                    <Link key={index} href={`/compare?file=${report[file]}`}>
                                                        <GitCompareArrows className="size-5" />
                                                        <ItemTitle>Compare Changes</ItemTitle>
                                                        <ChevronRightIcon className="size-4" />
                                                    </Link>
                                                </Item>
                                                <Item variant="outline" size="sm" asChild>
                                                    <Link key={index} href={`/compare?file=${report[file]}`}>
                                                        <GitCompareArrows className="size-5" />
                                                        <ItemTitle>Compare Changes</ItemTitle>
                                                        <ChevronRightIcon className="size-4" />
                                                    </Link>
                                                </Item>
                                            </CardAction>
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

                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Item variant="outline" size="sm" asChild>
                                                <Link key={index} href={`/compare?file=${report[file]}`}>
                                                    <ItemMedia>
                                                        <BadgeCheckIcon className="size-5" />
                                                    </ItemMedia>
                                                    <ItemContent>
                                                        <ItemTitle>Your profile has been verified.</ItemTitle>
                                                    </ItemContent>
                                                    <ItemActions>
                                                        <ChevronRightIcon className="size-4" />
                                                    </ItemActions>
                                                </Link>
                                            </Item>
                                            <Item variant="outline" size="sm" asChild>
                                                <Link key={index} href={`/compare?file=${report[file]}`}>
                                                    <ItemMedia>
                                                        <BadgeCheckIcon className="size-5" />
                                                    </ItemMedia>
                                                    <ItemContent>
                                                        <ItemTitle>Your profile has been verified.</ItemTitle>
                                                    </ItemContent>
                                                    <ItemActions>
                                                        <ChevronRightIcon className="size-4" />
                                                    </ItemActions>
                                                </Link>
                                            </Item>
                                        </CardFooter>
                                    </Card>
                                )
                            })}
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
