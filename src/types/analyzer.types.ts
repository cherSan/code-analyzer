export interface FileAnalysis {
    originalPath: string;
    originalCopyPath: string;
    lintingCopyPath: string;
    originalContent: string;
    lintingContent: string;
    eslintReport: ESLintReport;
    prettierReport: PrettierReport;
    gitStatus: GitFileStatus;
}

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

export interface TestTypes {
    unit?: TestFileCheck;
    integration?: TestFileCheck;
    e2e?: TestFileCheck;
}

export interface TestFileCheck {
    hasTestFile: boolean;
    path: string;
    isValid: boolean;
    error?: string;
}

export interface FileAnalysis {
    originalPath: string;
    originalCopyPath: string;
    lintingCopyPath: string;
    eslintReport: ESLintReport;
    prettierReport: PrettierReport;
    gitStatus: GitFileStatus;
    tests: TestTypes;
}

export interface AnalysisReport {
    timestamp: string;
    totalFiles: number;
    totalErrors: number;
    totalWarnings: number;
    files: FileAnalysis[];
    summary: {
        eslint: {
            totalErrors: number;
            totalWarnings: number;
            fixableErrors: number;
            fixableWarnings: number;
        };
        prettier: {
            formattedFiles: number;
            totalFiles: number;
        };
        tests: {
            totalFiles: number;
            hasTestFiles: number;
            missingTestFiles: number;
            invalidTestFiles: number;
        };
    };
}