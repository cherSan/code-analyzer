#!/usr/bin/env node
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import open from 'open';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runAnalyzer() {
    const app = express();
    const port = 3030;

    // 1. Получаем diff до eslint
    console.log('🔍 Running git diff BEFORE eslint...');
    const beforeDiff = execSync('git diff', { encoding: 'utf-8' });

    // 2. Запускаем eslint --fix
    console.log('🧹 Running eslint --fix...');
    try {
        execSync('npx eslint . --fix', { stdio: 'inherit' });
    } catch (e) {
        console.error('⚠️ ESLint fix failed:', (e as any).message);
    }

    // 3. Получаем diff после eslint
    console.log('🔍 Running git diff AFTER eslint...');
    const afterDiff = execSync('git diff', { encoding: 'utf-8' });

    // 4. Отдаём UI и API
    app.use('/', express.static(path.join(__dirname, 'ui')));
    app.get('/api/diff', (_, res) => {
        res.json({ before: beforeDiff, after: afterDiff });
    });

    app.listen(port, () => {
        console.log(`🚀 Analyzer running at http://localhost:${port}`);
        open(`http://localhost:${port}`);
    });
}

runAnalyzer();
