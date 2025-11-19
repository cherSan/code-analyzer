import { runCLI } from '@jest/core';
import { Config } from 'jest';
import chalk from 'chalk';
import { basename, dirname, extname, join } from 'path';
import { CoverageMap } from 'istanbul-lib-coverage';
import { pathExistsSync } from 'fs-extra';
import { Config as MainConfig } from '../types/config.types';
import {TestCoverageReport, TestCoverageSummary, TestReport, TestResultSummary} from '../types/analyzer.types';

export class TestFileUtil {
    jestConfig?: Config;

    constructor(config: MainConfig) {
        this.jestConfig = config.jest;
    }

    buildCoverageSummary(coverageMap?: CoverageMap | null): Record<string, TestCoverageSummary> {
        if (!coverageMap) return {};

        const coverageData = coverageMap.data ?? coverageMap;

        return Object.entries(coverageData).reduce<Record<string, TestCoverageSummary>>((summary, [file, fileCov]: [string, any]) => {
            if (!fileCov) return summary;

            const lineHitsMap = Object.entries(fileCov.statementMap || {}).reduce((linesAcc, [id, stmt]: [string, any]) => {
                const hit = fileCov.s?.[id] ?? 0;
                const startLine = stmt.start?.line ?? 0;
                const endLine = stmt.end?.line ?? startLine;
                for (let l = startLine; l <= endLine; l++) {
                    linesAcc[l] = Math.max(linesAcc[l] || 0, hit);
                }
                return linesAcc;
            }, {} as Record<number, number>);

            const linesTotal = Object.keys(lineHitsMap).length;
            const linesCovered = Object.values(lineHitsMap).filter(v => v > 0).length;

            const statementsTotal = Object.keys(fileCov.statementMap || {}).length;
            const statementsCovered = Object.values(fileCov.s || {}).filter(v => Number(v) > 0).length;

            const functionsTotal = Object.keys(fileCov.fnMap || {}).length;
            const functionsCovered = Object.values(fileCov.f || {}).filter(v => Number(v) > 0).length;

            const branchesTotal = Object.values(fileCov.branchMap || {}).reduce(
                (sum: number, branch: any) => sum + (branch.locations?.length || 0),
                0
            );
            const branchesCovered = Object.entries(fileCov.branchMap || {}).reduce((sum, [id]) => {
                const hits = fileCov.b?.[id] || [];
                return sum + hits.filter((h: number) => h > 0).length;
            }, 0);

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

            return summary;
        }, {});
    }

    async checkTestFile(filePath: string): Promise<TestReport> {
        if (!this.jestConfig) {
            return {
                unit: undefined,
                e2e: undefined,
                integration: undefined,
            };
        }
        const dir = dirname(filePath);
        const filename = basename(filePath, extname(filePath));
        const ext = extname(filePath);

        if (
            ext === '.tsx'
            && !filename.endsWith('.test')
            && !filename.endsWith('.spec')
        ) {
            const integrationTestPath = join(dir, `${filename}.component.test.tsx`);
            const e2eTestPath = join(dir, `${filename}.spec.tsx`);
            const unitTestPath =join(dir, `${filename}.test.tsx`);
            const report = await this.checkTestCoverage(filePath);
            return {
                integration: {
                    path: integrationTestPath,
                    exist: pathExistsSync(integrationTestPath),
                },
                e2e: {
                    path: e2eTestPath,
                    exist: pathExistsSync(e2eTestPath),
                },
                unit: {
                    path: unitTestPath,
                    exist: pathExistsSync(unitTestPath),
                    report,
                }
            }
        } else if (
            ext === '.ts'
            && !filename.endsWith('.test')
            && !filename.endsWith('.spec')
        ) {
            const unitTestPath = join(dir, `${filename}.test.tsx`);
            const report = await this.checkTestCoverage(filePath);
            return {
                integration: undefined,
                e2e: undefined,
                unit: {
                    path: unitTestPath,
                    exist: pathExistsSync(unitTestPath),
                    report,
                }
            }
        } else if (
            !filename.endsWith('.test')
            && !filename.endsWith('.spec')
        ) {
            const unitTestPath = join(dir, `${filename}.test.${ext}`);
            const report = await this.checkTestCoverage(filePath);
            return {
                unit: {
                    path: unitTestPath,
                    exist: pathExistsSync(unitTestPath),
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

    async checkTestCoverage(filePath: string): Promise<TestCoverageReport | undefined> {
        const dir = dirname(filePath);
        const filename = basename(filePath, extname(filePath));
        const ext = extname(filePath);

        if (!['.ts', '.tsx'].includes(ext)) return undefined;
        if (filename.endsWith('.test') || filename.endsWith('.spec')) return undefined;

        const unitTestPath = join(dir, `${filename}.test.tsx`);
        if (!pathExistsSync(unitTestPath)) return undefined;

        console.log(chalk.gray(`Running Jest via API for: ${unitTestPath}`));

        const result = await runCLI(this.jestConfig as any, [process.cwd()]);
        const jestJson = result.results;

        if (!jestJson) {
            console.warn(chalk.yellow(`No Jest result returned for ${unitTestPath}`));
            return undefined;
        }

        const testSummary = (jestJson.testResults || []).reduce<Record<string, Record<string, TestResultSummary>>>((accSuites, suite) => {
            const suiteName = basename(suite?.testFilePath || 'unknown');
            accSuites[suiteName] = (suite.testResults ?? []).reduce<Record<string, TestResultSummary>>((accTests, test) => {
                const fullTitle = [...(test.ancestorTitles || []), test.title].join(' > ');
                accTests[fullTitle] = {
                    status: test.status,
                    error: test.failureMessages?.length ? test.failureMessages.join('\n') : null,
                };
                return accTests;
            }, {});

            return accSuites;
        }, {});

        return {
            coverage: this.buildCoverageSummary(jestJson.coverageMap),
            totalTests: jestJson.numTotalTests,
            totalTestSuites: jestJson.numTotalTestSuites,
            testPassed: jestJson.numPassedTests,
            testSkipped: jestJson.numPendingTests,
            testFailed: jestJson.numFailedTests,
            testSummary
        };
    }
}
