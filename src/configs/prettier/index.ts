import {RequiredOptions} from "prettier";

export const prettierRules: Omit<RequiredOptions, 'parser'> = {
    // Core formatting
    semi: true,
    singleQuote: true,
    jsxSingleQuote: false,
    trailingComma: 'all' as const,
    bracketSpacing: true,
    bracketSameLine: false,

    // Code style
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,
    arrowParens: 'always' as const,
    quoteProps: 'as-needed' as const,
    proseWrap: 'preserve' as const,

    // Pragmas
    requirePragma: false,
    insertPragma: false,

    // Language specific
    htmlWhitespaceSensitivity: 'css' as const,
    vueIndentScriptAndStyle: false,
    embeddedLanguageFormatting: 'auto' as const,

    // Line endings
    endOfLine: 'crlf' as const,

    // Experimental
    singleAttributePerLine: false,
    experimentalOperatorPosition: 'end' as const,
    experimentalTernaries: false
};