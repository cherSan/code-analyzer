export interface ESLintReport {
    errorCount: number;
    warningCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
    messages: ESLintMessage[];
    fixed: boolean;
    output?: string;
}

export interface ESLintMessage {
    line: number;
    column: number;
    ruleId: string | null;
    message: string;
    severity: number;
    nodeType: string | null;
    source: string | null;
    endLine?: number;
    endColumn?: number;
    fix?: ESLintFix;
    suggestions?: ESLintSuggestion[];
}

export interface ESLintFix {
    range: [number, number];
    text: string;
}

export interface ESLintSuggestion {
    desc: string;
    fix: ESLintFix;
    messageId?: string;
}

export interface PrettierReport {
    formatted: boolean;
    changes: boolean;
    input: string;
    output: string;
}

export interface GitFileStatus {
    status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked';
    staged: boolean;
}

export interface ESLintSummary {
    total_errors: number;
    total_warnings: number;
    fixable_errors: number;
    fixable_warnings: number;
}

export interface PrettierSummary {
    formatted_files: number;
}

export interface TestSummary {
    tested_files: number;
    missed_tested_files: number;
    invalid_tested_files: number;
    code_coverage: number;
}

export interface MainTestReport {
    path: string;
    isValid: boolean;
}

export interface UnitTestReport extends MainTestReport {
    coverage: number;
}

export interface TestReport {
    unit?: UnitTestReport;
    integration?: MainTestReport;
    e2e?: MainTestReport;
}

export type MainReport = Record<string, string>;

export interface SummaryReport {
    eslint?: ESLintSummary;
    prettier?: PrettierSummary;
    test?: TestSummary;
    original_total_code_lines?: number;
    linted_total_code_lines?: number;
}

export interface FileReport {
    original_file_path?: string;
    original_file_content?: string;
    linted_file_content?: string;
    eslint_report?: ESLintReport;
    prettier_report?: PrettierReport;
    test_report?: TestReport;
    git_status?: GitFileStatus;
}
