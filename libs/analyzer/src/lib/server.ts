import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function startAnalyzerServer() {
    const app = express();
    const port = 3333;

    const vite = await createViteServer({
        root: path.resolve(__dirname, '../ui'),
        server: { middlewareMode: true },
    });

    app.use(vite.middlewares);

    app.listen(port, () => {
        console.log(`🚀 Analyzer running: http://localhost:${port}`);
    });
}
