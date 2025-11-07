import { ESLint } from 'eslint';
import prettier from 'prettier';
import chalk from 'chalk';
import * as fs from 'fs-extra';

export interface LintResult {
    filePath: string;
    errorCount: number;
    warningCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
    messages: Array<{
        line: number;
        column: number;
        ruleId: string;
        message: string;
        severity: number;
    }>;
}

export class LintUtil {
    private eslint: ESLint;

    constructor() {
        this.eslint = new ESLint({
            useEslintrc: false,
            ignore: false,
            baseConfig: {
                parser: '@typescript-eslint/parser', // Добавляем TypeScript парсер
                parserOptions: {
                    ecmaVersion: 2020,
                    sourceType: 'module',
                    ecmaFeatures: {
                        jsx: true
                    },
                    project: './tsconfig.json' // Указываем tsconfig
                },
                env: {
                    browser: true,
                    es2020: true,
                    node: true
                },
                settings: {
                    react: {
                        version: 'detect'
                    }
                },
                plugins: ['@typescript-eslint'], // Добавляем TypeScript плагин
                rules: {
                    // Strict rules for production projects

                    // Possible Errors
                    'no-console': 'error',
                    'no-debugger': 'error',
                    'no-dupe-keys': 'error',
                    'no-duplicate-case': 'error',
                    'no-empty': 'error',
                    'no-ex-assign': 'error',
                    'no-extra-boolean-cast': 'error',
                    'no-extra-semi': 'error',
                    'no-func-assign': 'error',
                    'no-inner-declarations': 'error',
                    'no-irregular-whitespace': 'error',
                    'no-obj-calls': 'error',
                    'no-prototype-builtins': 'error',
                    'no-sparse-arrays': 'error',
                    'no-unexpected-multiline': 'error',
                    'no-unreachable': 'error',
                    'no-unsafe-finally': 'error',
                    'no-unsafe-negation': 'error',
                    'use-isnan': 'error',
                    'valid-typeof': 'error',

                    // Best Practices
                    'curly': ['error', 'all'],
                    'dot-notation': 'error',
                    'eqeqeq': 'error',
                    'no-eval': 'error',
                    'no-extra-bind': 'error',
                    'no-floating-decimal': 'error',
                    'no-implied-eval': 'error',
                    'no-multi-spaces': 'error',
                    'no-new': 'error',
                    'no-new-func': 'error',
                    'no-new-wrappers': 'error',
                    'no-octal': 'error',
                    'no-return-assign': 'error',
                    'no-self-compare': 'error',
                    'no-sequences': 'error',
                    'no-throw-literal': 'error',
                    'no-unused-expressions': 'error',
                    'no-useless-call': 'error',
                    'no-useless-concat': 'error',
                    'no-void': 'error',
                    'no-with': 'error',
                    'prefer-promise-reject-errors': 'error',
                    'require-await': 'error',
                    'yoda': 'error',

                    // Variables
                    'no-delete-var': 'error',
                    'no-label-var': 'error',
                    'no-shadow': 'error',
                    'no-shadow-restricted-names': 'error',
                    'no-undef': 'error',
                    'no-undef-init': 'error',
                    'no-undefined': 'error',
                    'no-unused-vars': 'off', // Отключаем базовое правило
                    '@typescript-eslint/no-unused-vars': 'error', // Используем TypeScript версию
                    'no-use-before-define': 'error',

                    // Stylistic Issues
                    'array-bracket-newline': ['error', 'consistent'],
                    'array-bracket-spacing': ['error', 'never'],
                    'array-element-newline': ['error', 'consistent'],
                    'block-spacing': 'error',
                    'brace-style': ['error', '1tbs'],
                    'camelcase': 'error',
                    'comma-dangle': ['error', 'always-multiline'],
                    'comma-spacing': 'error',
                    'comma-style': 'error',
                    'computed-property-spacing': 'error',
                    'eol-last': 'error',
                    'func-call-spacing': 'error',
                    'function-paren-newline': ['error', 'consistent'],
                    'implicit-arrow-linebreak': 'error',
                    'indent': ['error', 4],
                    'jsx-quotes': 'error',
                    'key-spacing': 'error',
                    'keyword-spacing': 'error',
                    'linebreak-style': ['error', 'windows'],
                    'max-len': ['error', {
                        code: 100,
                        comments: 80,
                        ignoreUrls: true,
                        ignoreStrings: true,
                        ignoreTemplateLiterals: true,
                        ignoreRegExpLiterals: true
                    }],
                    'multiline-ternary': ['error', 'always-multiline'],
                    'new-parens': 'error',
                    'newline-per-chained-call': 'error',
                    'no-mixed-operators': 'error',
                    'no-mixed-spaces-and-tabs': 'error',
                    'no-multi-assign': 'error',
                    'no-multiple-empty-lines': ['error', { max: 1 }],
                    'no-tabs': 'error',
                    'no-trailing-spaces': 'error',
                    'no-whitespace-before-property': 'error',
                    'nonblock-statement-body-position': 'error',
                    'object-curly-newline': ['error', { consistent: true }],
                    'object-curly-spacing': ['error', 'always'],
                    'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
                    'one-var': ['error', 'never'],
                    'operator-linebreak': 'error',
                    'padded-blocks': ['error', 'never'],
                    'padding-line-between-statements': [
                        'error',
                        { blankLine: 'always', prev: '*', next: 'return' },
                        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
                        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] }
                    ],
                    'quote-props': ['error', 'consistent-as-needed'],
                    'quotes': ['error', 'single'],
                    'semi': ['error', 'always'],
                    'semi-spacing': 'error',
                    'semi-style': 'error',
                    'space-before-blocks': 'error',
                    'space-before-function-paren': ['error', {
                        anonymous: 'never',
                        named: 'never',
                        asyncArrow: 'always'
                    }],
                    'space-in-parens': 'error',
                    'space-infix-ops': 'error',
                    'space-unary-ops': 'error',
                    'spaced-comment': 'error',
                    'switch-colon-spacing': 'error',
                    'template-tag-spacing': 'error',
                    'unicode-bom': 'error',

                    // ES6
                    'arrow-body-style': 'error',
                    'arrow-parens': ['error', 'always'],
                    'arrow-spacing': 'error',
                    'generator-star-spacing': 'error',
                    'no-confusing-arrow': 'error',
                    'no-duplicate-imports': 'error',
                    'no-useless-computed-key': 'error',
                    'no-useless-constructor': 'error',
                    'no-useless-rename': 'error',
                    'no-var': 'error',
                    'object-shorthand': 'error',
                    'prefer-arrow-callback': 'error',
                    'prefer-const': 'error',
                    'prefer-destructuring': 'error',
                    'prefer-rest-params': 'error',
                    'prefer-spread': 'error',
                    'prefer-template': 'error',
                    'rest-spread-spacing': 'error',
                    'template-curly-spacing': 'error',
                    'yield-star-spacing': 'error',

                    // React
                    'react/react-in-jsx-scope': 'off',
                    'react/jsx-uses-react': 'off',
                    'react/jsx-uses-vars': 'error',
                    'react/jsx-no-undef': 'error',
                    'react/jsx-no-useless-fragment': 'error',
                    'react/jsx-key': 'error',
                    'react/jsx-no-duplicate-props': 'error'
                }
            },
            fix: true
        } as any);
    }

    /**
     * Lint array of files with auto-fix
     */
    async lintFiles(filePaths: string[]): Promise<LintResult[]> {
        console.log(chalk.blue('🔍 Linting files with strict production rules...'));

        const results: LintResult[] = [];

        for (const filePath of filePaths) {
            try {
                console.log(chalk.gray(`  Linting: ${filePath}`));

                const content = await fs.readFile(filePath, 'utf8');
                console.log(chalk.gray(`  File content preview: ${content.substring(0, 100)}...`));

                // Используем lintFiles вместо lintText для правильной работы с TypeScript
                const lintResults = await this.eslint.lintFiles([filePath]);

                console.log(chalk.blue(`  ESLint results for ${filePath}:`), lintResults);

                for (const result of lintResults) {
                    // Apply fixes
                    if (result.output) {
                        await fs.writeFile(filePath, result.output);
                        console.log(chalk.blue(`  🔧 Applied ESLint fixes to: ${filePath}`));
                    }

                    results.push({
                        filePath: result.filePath,
                        errorCount: result.errorCount,
                        warningCount: result.warningCount,
                        fixableErrorCount: result.fixableErrorCount,
                        fixableWarningCount: result.fixableWarningCount,
                        messages: result.messages.map(msg => ({
                            line: msg.line,
                            column: msg.column,
                            ruleId: msg.ruleId || '',
                            message: msg.message,
                            severity: msg.severity
                        }))
                    });

                    this.printFileResults(result);
                }

                // Prettier formatting with strict rules
                await this.formatWithPrettier(filePath);

            } catch (error) {
                console.error(chalk.red(`❌ Error linting ${filePath}:`), error);
            }
        }

        return results;
    }

    /**
     * Format file with strict Prettier rules
     */
    private async formatWithPrettier(filePath: string): Promise<void> {
        try {
            const content = await fs.readFile(filePath, 'utf8');

            const fileInfo = await prettier.getFileInfo(filePath);

            if (fileInfo.ignored || !fileInfo.inferredParser) {
                return;
            }

            const formatted = await prettier.format(content, {
                parser: fileInfo.inferredParser,
                semi: true,
                singleQuote: true,
                trailingComma: 'all', // Always trailing commas
                printWidth: 100, // Max 100 characters
                tabWidth: 4, // 4 spaces
                useTabs: false, // No tabs
                bracketSpacing: true,
                arrowParens: 'always',
                endOfLine: 'crlf' // Windows line endings
            });

            if (formatted !== content) {
                await fs.writeFile(filePath, formatted);
                console.log(chalk.blue(`  💅 Formatted with Prettier: ${filePath}`));
            }
        } catch (error) {
            console.error(chalk.yellow(`⚠ Prettier formatting skipped for ${filePath}:`), error);
        }
    }

    /**
     * Print lint results for a single file
     */
    private printFileResults(result: ESLint.LintResult): void {
        const relativePath = result.filePath.replace(process.cwd(), '').replace(/^\//, '');

        if (result.errorCount === 0 && result.warningCount === 0) {
            console.log(chalk.green(`✓ ${relativePath} - No issues`));
            return;
        }

        console.log(chalk.yellow(`📋 ${relativePath}:`));

        for (const message of result.messages) {
            const symbol = message.severity === 2 ? chalk.red('✗') : chalk.yellow('⚠');
            console.log(`  ${symbol} Line ${message.line}:${message.column} - ${message.message} ${chalk.gray(`(${message.ruleId})`)}`);
        }
    }

    /**
     * Get total statistics
     */
    getStats(results: LintResult[]): {
        totalErrors: number;
        totalWarnings: number;
        totalFiles: number;
        fixableErrors: number;
        fixableWarnings: number;
    } {
        console.log(`  📊 Calculating total statistics...`, results);
        const totalErrors = results.reduce((sum, result) => sum + result.errorCount, 0);
        const totalWarnings = results.reduce((sum, result) => sum + result.warningCount, 0);
        const fixableErrors = results.reduce((sum, result) => sum + result.fixableErrorCount, 0);
        const fixableWarnings = results.reduce((sum, result) => sum + result.fixableWarningCount, 0);

        return {
            totalErrors,
            totalWarnings,
            totalFiles: results.length,
            fixableErrors,
            fixableWarnings
        };
    }
}