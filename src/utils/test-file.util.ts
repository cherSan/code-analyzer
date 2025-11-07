import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

export interface TestFileCheck {
    hasTestFile: boolean;
    expectedTestPath: string;
    actualTestPath?: string;
    isValid: boolean;
    error?: string;
}

export class TestFileUtil {
    /**
     * Check if file has corresponding test file
     */
    async checkTestFile(filePath: string): Promise<TestFileCheck> {
        const dir = path.dirname(filePath);
        const filename = path.basename(filePath, path.extname(filePath));
        const ext = path.extname(filePath);

        let expectedTestPath: string;

        // Determine expected test file name based on file type
        if (ext === '.tsx') {
            // For React components: [filename].component.test.tsx
            const baseName = filename.replace('.component', ''); // Убираем .component если уже есть
            expectedTestPath = path.join(dir, `${baseName}.component.test.tsx`);
        } else if (ext === '.ts') {
            // For TypeScript files: [filename].test.ts
            expectedTestPath = path.join(dir, `${filename}.test.ts`);
        } else {
            return {
                hasTestFile: false,
                expectedTestPath: '',
                isValid: true,
                error: `Skipped file type: ${ext}`
            };
        }

        const exists = await fs.pathExists(expectedTestPath);

        // Also check for common alternative test file patterns
        const alternativePatterns = [
            path.join(dir, `${filename}.test${ext}`),
            path.join(dir, `${filename}.spec${ext}`),
            path.join(dir, `${filename}.component.spec.tsx`),
            path.join(dir, '__tests__', `${filename}.test${ext}`),
            path.join(dir, '__tests__', `${filename}.spec${ext}`),
            path.join(dir, 'tests', `${filename}.test${ext}`),
            path.join(dir, 'tests', `${filename}.spec${ext}`)
        ];

        let actualTestPath: string | undefined;
        for (const pattern of alternativePatterns) {
            if (await fs.pathExists(pattern)) {
                actualTestPath = pattern;
                break;
            }
        }

        return {
            hasTestFile: exists || !!actualTestPath,
            expectedTestPath,
            actualTestPath,
            isValid: exists, // Only valid if it matches the expected pattern
            error: !exists && !actualTestPath ? `Missing test file: ${path.basename(expectedTestPath)}` : undefined
        };
    }

    /**
     * Check test files for multiple files
     */
    async checkTestFiles(filePaths: string[]): Promise<Map<string, TestFileCheck>> {
        const results = new Map<string, TestFileCheck>();

        for (const filePath of filePaths) {
            const check = await this.checkTestFile(filePath);
            results.set(filePath, check);
        }

        return results;
    }

    /**
     * Print test file check results
     */
    printTestFileResults(results: Map<string, TestFileCheck>): void {
        let missingTests = 0;
        let invalidTests = 0;
        let validTests = 0;

        console.log(chalk.blue('\n🧪 Test File Analysis:'));

        for (const [filePath, check] of results) {
            const relativePath = path.relative(process.cwd(), filePath);

            if (check.isValid) {
                console.log(chalk.green(`✓ ${relativePath} - Has proper test file`));
                validTests++;
            } else if (check.hasTestFile && check.actualTestPath) {
                const actualRelative = path.relative(process.cwd(), check.actualTestPath);
                console.log(chalk.yellow(`⚠ ${relativePath} - Has test file but wrong name/naming`));
                console.log(chalk.gray(`  Expected: ${path.basename(check.expectedTestPath)}`));
                console.log(chalk.gray(`  Actual: ${actualRelative}`));
                invalidTests++;
            } else {
                console.log(chalk.red(`✗ ${relativePath} - Missing test file`));
                console.log(chalk.gray(`  Expected: ${path.basename(check.expectedTestPath)}`));
                missingTests++;
            }
        }

        console.log(chalk.blue('\n📊 Test File Summary:'));
        console.log(chalk.green(`  ✓ Proper test files: ${validTests}`));
        console.log(chalk.yellow(`  ⚠ Wrong test file names: ${invalidTests}`));
        console.log(chalk.red(`  ✗ Missing test files: ${missingTests}`));
        console.log(chalk.blue(`  📝 Total files checked: ${results.size}`));
    }
}