'use client';

import React, {useRef, useCallback, useEffect} from 'react';
import {DiffEditor, useMonaco} from '@monaco-editor/react';
import { ESLintMessage } from '@/types/analyzer.types';
import { editor, MarkerSeverity, Range } from 'monaco-editor';
import {Header} from "@/components/ui/typography";
import {Button} from "@/components/ui/button";

interface MonacoDiffProps {
    originalContent: string;
    lintedContent: string;
    fileName: string;
    eslintMessages: ESLintMessage[];
}

export default function MonacoDiff({
                                       originalContent,
                                       lintedContent,
                                       fileName,
                                       eslintMessages,
                                   }: MonacoDiffProps) {
    const decorationsRef = useRef<string[]>([]);
    const monaco = useMonaco();

    useEffect(() => {
        if (!monaco) return;

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.React,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.ESNext,
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            noEmit: true,
            typeRoots: [],
        });

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.React,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        });

        fetch('/monaco-types/react/index.d.ts')
            .then(res => res.text())
            .then(text => {
                monaco.languages.typescript.typescriptDefaults.addExtraLib(
                    text,
                    'file:///node_modules/@types/react/index.d.ts'
                );
            });

        fetch('/monaco-types/react-dom/index.d.ts')
            .then(res => res.text())
            .then(text => {
                monaco.languages.typescript.typescriptDefaults.addExtraLib(
                    text,
                    'file:///node_modules/@types/react-dom/index.d.ts'
                );
            });
    }, [monaco]);

    const language =
        fileName.endsWith('.tsx') || fileName.endsWith('.ts')
            ? 'typescript'
            : fileName.endsWith('.jsx') || fileName.endsWith('.js')
                ? 'javascript'
                : fileName.endsWith('.css')
                    ? 'css'
                    : fileName.endsWith('.json')
                        ? 'json'
                        : 'typescript';

    const handleEditorMount = useCallback(
        (diffEditor: editor.IStandaloneDiffEditor) => {
            const originalEditor = diffEditor.getOriginalEditor();
            const model = originalEditor.getModel();
            if (!model) return;

            const markers: editor.IMarkerData[] = eslintMessages.map((msg) => ({
                startLineNumber: msg.line,
                startColumn: msg.column,
                endLineNumber: msg.endLine || msg.line,
                endColumn: msg.endColumn || msg.column + 1,
                message: msg.message,
                severity: msg.severity === 2 ? MarkerSeverity.Error : MarkerSeverity.Warning,
                code: msg.ruleId || undefined,
            }));

            editor.setModelMarkers(model, 'eslint', markers);

            const eslintDecorations: editor.IModelDeltaDecoration[] = eslintMessages
                .filter(msg => msg.fix || msg.message) // можно фильтровать только реальные ошибки
                .map(msg => ({
                    range: new Range(
                        msg.line,
                        msg.column - 1 > 0 ? msg.column - 1 : msg.column,
                        msg.endLine || msg.line,
                        msg.endColumn || msg.column + 2
                    ),
                    options: {
                        inlineClassName: 'eslint-inline-highlight',
                        hoverMessage: {
                            value: msg.fix
                                ? `ESLint: ${msg.message}\nFix: ${msg.fix.text}`
                                : `ESLint: ${msg.message}`,
                        },
                    },
                }));
            decorationsRef.current = originalEditor.deltaDecorations(decorationsRef.current, eslintDecorations);
        },
        [eslintMessages]
    );

    const onApply = () => {
        // logic to apply the fixed content
        navigator.clipboard.writeText(lintedContent).then(() => {
            alert('Fixed content copied to clipboard!');
        });
    }

    return (
        <div style={{ height: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Header as="h4" variant="info">ORIGINAL FILE</Header>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Header as="h4" variant="info">FIXED VARIANT</Header>
                    <Button onClick={onApply}>Apply</Button>
                </div>
            </div>
            <DiffEditor
                height="500px"
                language={language}
                original={originalContent}
                modified={lintedContent}
                theme="vs-dark"
                onMount={handleEditorMount}
                keepCurrentOriginalModel={true}
                options={{
                    readOnly: false,
                    renderValidationDecorations: 'on',
                    renderFinalNewline: 'on',
                    selectOnLineNumbers: true,
                    renderControlCharacters: true,
                    originalEditable: false,
                    fontSize: 14,
                    minimap: { enabled: false },
                    renderSideBySide: true,
                    scrollBeyondLastLine: false,
                    diffAlgorithm: 'advanced',
                    enableSplitViewResizing: false,
                    renderLineHighlight: 'all',
                    wordWrap: 'off',
                    diffWordWrap: 'off',
                }}
            />
        </div>
    );
}
