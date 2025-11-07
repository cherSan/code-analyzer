'use client';

import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

interface MonacoDiffProps {
    originalContent: string;
    lintedContent: string;
    fileName: string;
}

export default function MonacoDiff({
                                       originalContent,
                                       lintedContent,
                                       fileName
                                   }: MonacoDiffProps) {
    const language =
        fileName.endsWith('.tsx') ? 'typescript' :
        fileName.endsWith('.ts') ? 'typescript' :
        fileName.endsWith('.jsx') ? 'javascript' :
        fileName.endsWith('.js') ? 'javascript' :
        fileName.endsWith('.css') ? 'css' :
        fileName.endsWith('.json') ? 'json' : 'typescript';

    return (
        <div className="monaco-diff-container">
            <DiffEditor
                height="500px"
                language={language}
                original={lintedContent}
                modified={originalContent}
                theme="vs-dark"
                options={{
                    readOnly: false,
                    renderValidationDecorations: 'on',
                    renderIndicators: true,
                    originalEditable: false,
                    fontSize: 14,
                    wordWrap: 'on',
                    minimap: { enabled: false },
                    renderSideBySide: true,
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    );
}