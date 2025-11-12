import * as path from 'path';
import chalk from 'chalk';
import {pathExistsSync} from "fs-extra";
import {TestReport} from "../types/analyzer.types";

export class TestFileUtil {
    /**
     * Check if file has corresponding test file
     */
    checkTestFile(filePath: string): TestReport {
        const dir = path.dirname(filePath);
        const filename = path.basename(filePath, path.extname(filePath));
        const ext = path.extname(filePath);

        if (
            ext === '.tsx'
            && !filename.endsWith('.test')
            && !filename.endsWith('.spec')
        ) {
            const baseName = filename.replace('.component', '');
            const integrationTestPath = path.join(dir, `${baseName}.component.test.tsx`);
            const e2eTestPath = path.join(dir, `${baseName}.spec.tsx`);
            const unitTestPath = path.join(dir, `${baseName}.test.tsx`);
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
                    coverage: 0,
                }
            }
        } else if (
            ext === '.ts'
            && !filename.endsWith('.test')
            && !filename.endsWith('.spec')
        ) {
            const unitTestPath = path.join(dir, `${filename}.test.tsx`);
            return {
                integration: undefined,
                e2e: undefined,
                unit: {
                    path: unitTestPath,
                    isValid: pathExistsSync(unitTestPath),
                    coverage: 0,
                }
            }
        } else if (
            !filename.endsWith('.test')
            && !filename.endsWith('.spec')
        ) {
            const unitTestPath = path.join(dir, `${filename}.test.${ext}`);
            return {
                unit: {
                    path: unitTestPath,
                    isValid: pathExistsSync(unitTestPath),
                    coverage: 0,
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

    /**
     * Check test files for multiple files
     */
    async checkTestFiles(filePaths: string[]): Promise<Map<string, TestReport>> {
        const results = new Map<string, TestReport>();

        for (const filePath of filePaths) {
            const check = await this.checkTestFile(filePath);
            results.set(filePath, check);
        }

        return results;
    }

    /**
     * Print test file check results
     */
    printTestFileResults(results: Map<string, TestReport>): void {
        let missingTests = 0;
        let invalidTests = 0;
        let validTests = 0;

        console.log(chalk.blue('\n🧪 Test File Analysis:'));

        for (const [_, check] of results) {
            if (check.unit?.isValid) validTests++;
            else missingTests++;

            if (check.e2e?.isValid) validTests++;
            else missingTests++;

            if (check.integration?.isValid) validTests++;
            else missingTests++;
        }

        console.log(chalk.blue('\n📊 Test File Summary:'));
        console.log(chalk.green(`  ✓ Proper test files: ${validTests}`));
        console.log(chalk.yellow(`  ⚠ Wrong test file names: ${invalidTests}`));
        console.log(chalk.red(`  ✗ Missing test files: ${missingTests}`));
        console.log(chalk.blue(`  📝 Total files checked: ${results.size}`));
    }
}
