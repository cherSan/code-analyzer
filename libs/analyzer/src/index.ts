import express from 'express';
import path from 'path';
import { execSync } from 'child_process';
import open from 'open';

async function runAnalyzer() {
    const app = express();
    const port = 3030;

    // 1. Получаем diff до eslint
    console.log('🔍 Running git diff BEFORE eslint...');
    const beforeDiff = execSync('git diff', { encoding: 'utf-8' });

    // 2. ESLint fix
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
    // path к dist/ui относительно текущей рабочей директории
    app.use('/', express.static(path.join(process.cwd(), 'dist/ui')));
    app.get('/api/diff', (_, res) => {
        res.json({ before: beforeDiff, after: afterDiff });
    });

    app.listen(port, () => {
        console.log(`🚀 Analyzer running at http://localhost:${port}`);
        open(`http://localhost:${port}`);
    });
}

runAnalyzer();
