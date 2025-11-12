import * as path from 'path';
import {pathExistsSync, readFileSync, removeSync, existsSync} from "fs-extra";
import {basename, dirname, extname, join} from "path";
import {exec} from "child_process";
import chalk from "chalk";
import {v4 as uuidv4} from "uuid";
import {TestCoverageReport, TestCoverageSummary, TestReport, TestResultSummary} from "../types/analyzer.types";

export class TestFileUtil {
    private readonly reportDir: string;
    constructor() {
        this.reportDir = join(process.cwd(), '.code-analyzer');
    }

    private buildCoverageSummary(coverageMap: any): Record<string, TestCoverageSummary> {
        const summary: Record<string, TestCoverageSummary> = {};

        for (const file in coverageMap) {
            const fileCov = coverageMap[file];

            // Statements
            const statementsTotal = Object.keys(fileCov.statementMap).length;
            const statementsCovered = Object.values(fileCov.s).filter(v => parseInt(`${v}`) > 0).length;

            // Functions
            const functionsTotal = Object.keys(fileCov.fnMap).length;
            const functionsCovered = Object.values(fileCov.f).filter(v => parseInt(`${v}`) > 0).length;

            // Branches
            const branchesTotal = Object.keys(fileCov.branchMap)
                .reduce((sum, k) => sum + fileCov.branchMap[k].locations.length, 0);
            const branchesCovered = Object.keys(fileCov.branchMap)
                .reduce((sum, k) => {
                    const hits = fileCov.b[k];
                    return sum + hits.filter((h: number) => h > 0).length;
                }, 0);

            // Lines
            const lineHitsMap: Record<number, number> = {};
            Object.entries(fileCov.statementMap).forEach(([id, stmt]: [string, any]) => {
                const hit = fileCov.s[id] || 0;
                const startLine = stmt.start.line;
                const endLine = stmt.end.line ?? startLine;
                for (let l = startLine; l <= endLine; l++) {
                    lineHitsMap[l] = Math.max(lineHitsMap[l] || 0, hit);
                }
            });

            const linesTotal = Object.keys(lineHitsMap).length;
            const linesCovered = Object.values(lineHitsMap).filter(v => v > 0).length;

            summary[file] = {
                lines: {
                    total: linesTotal,
                    covered: linesCovered,
                    skipped: linesTotal - linesCovered,
                    pct: linesTotal ? +(linesCovered / linesTotal * 100).toFixed(2) : 100
                },
                statements: {
                    total: statementsTotal,
                    covered: statementsCovered,
                    skipped: statementsTotal - statementsCovered,
                    pct: statementsTotal ? +(statementsCovered / statementsTotal * 100).toFixed(2) : 100
                },
                functions: {
                    total: functionsTotal,
                    covered: functionsCovered,
                    skipped: functionsTotal - functionsCovered,
                    pct: functionsTotal ? +(functionsCovered / functionsTotal * 100).toFixed(2) : 100
                },
                branches: {
                    total: branchesTotal,
                    covered: branchesCovered,
                    skipped: branchesTotal - branchesCovered,
                    pct: branchesTotal ? +(branchesCovered / branchesTotal * 100).toFixed(2) : 100
                }
            };
        }

        return summary;
    }

    private generateUniquePath(): string {
        const uniqueId = uuidv4();
        return join(this.reportDir, `${uniqueId}.json`);
    }

    async checkTestFile(filePath: string): Promise<TestReport> {
        const dir = dirname(filePath);
        const filename = basename(filePath, extname(filePath));
        const ext = extname(filePath);

        if (
            ext === '.tsx'
            && !filename.endsWith('.test')
            && !filename.endsWith('.spec')
        ) {
            const integrationTestPath = path.join(dir, `${filename}.component.test.tsx`);
            const e2eTestPath = path.join(dir, `${filename}.spec.tsx`);
            const unitTestPath = path.join(dir, `${filename}.test.tsx`);
            const report = await this.checkTestCoverage(filePath);
            return {
                integration: {
                    path: integrationTestPath,
                    isValid: pathExistsSync(integrationTestPath),
                },
                e2e: {
                    path: e2eTestPath,
                    isValid: pathExistsSync(e2eTestPath),
                },
                unit: {
                    path: unitTestPath,
                    isValid: pathExistsSync(unitTestPath),
                    report,
                }
            }
        } else if (
            ext === '.ts'
            && !filename.endsWith('.test')
            && !filename.endsWith('.spec')
        ) {
            const unitTestPath = path.join(dir, `${filename}.test.tsx`);
            const report = await this.checkTestCoverage(filePath);
            return {
                integration: undefined,
                e2e: undefined,
                unit: {
                    path: unitTestPath,
                    isValid: pathExistsSync(unitTestPath),
                    report,
                }
            }
        } else if (
            !filename.endsWith('.test')
            && !filename.endsWith('.spec')
        ) {
            const unitTestPath = path.join(dir, `${filename}.test.${ext}`);
            const report = await this.checkTestCoverage(filePath);
            return {
                unit: {
                    path: unitTestPath,
                    isValid: pathExistsSync(unitTestPath),
                    report,
                },
                e2e: undefined,
                integration: undefined,
            };
        } else {
            return {
                unit: undefined,
                e2e: undefined,
                integration: undefined,
            };
        }
    }

    private checkTestCoverage(filePath: string): Promise<TestCoverageReport | undefined> {
        return new Promise((resolve) => {
            const dir = dirname(filePath);
            const filename = basename(filePath, extname(filePath));
            const ext = extname(filePath);

            if (
                (ext === '.tsx' || ext === '.ts')
                && !filename.endsWith('.test')
                && !filename.endsWith('.spec')
            ) {
                const unitTestPath = path.join(dir, `${filename}.test.tsx`);
                if (!pathExistsSync(unitTestPath)) return resolve(undefined);
                const tempReportPath = this.generateUniquePath();
                const cmd = `npx jest --coverage --json ${unitTestPath} --coverageReporters="json-summary" --outputFile=${tempReportPath}`;
                console.log(chalk.gray(`Executing: ${cmd}`));
                exec(cmd, () => {
                    if (!existsSync(tempReportPath)) {
                        console.warn(chalk.yellow(`Jest did not produce a report at ${tempReportPath}`));
                        return resolve(undefined);
                    }

                    try {
                        const raw = readFileSync(tempReportPath, 'utf8');
                        const jestJson = JSON.parse(raw);

                        const coverage: Record<string, TestCoverageSummary> = {};
                        for (const file in jestJson.coverageMap) {
                            coverage[file] = jestJson.coverageMap[file].lines || jestJson.coverageMap[file];
                        }

                        const testSummary: Record<string, Record<string, TestResultSummary>> = {};
                        jestJson.testResults.forEach((suite: any) => {
                            const suiteName = path.basename(suite.name);
                            testSummary[suiteName] = {};

                            suite.assertionResults.forEach((test: any) => {
                                const fullTitle = [...test.ancestorTitles, test.title].join(' > ');
                                testSummary[suiteName][fullTitle] = {
                                    status: test.status,
                                    error: test.failureMessages?.length ? test.failureMessages.join('\n') : null
                                };
                            });
                        });

                        removeSync(tempReportPath);

                        resolve({
                            coverage: this.buildCoverageSummary(coverage),
                            totalTests: jestJson.numTotalTests,
                            totalTestSuites: jestJson.numTotalTestSuites,
                            testPassed: jestJson.numPassedTests,
                            testSkipped: jestJson.numPendingTests,
                            testFailed: jestJson.numFailedTests,
                            testSummary
                        });

                    } catch (e) {
                        console.error(chalk.red('Failed to parse Jest report:'), e);
                        resolve(undefined);
                    }
                });
            } else {
                resolve(undefined);
            }
        });
    }
}
