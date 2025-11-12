import chokidar from 'chokidar';
import type { ChildProcess } from 'child_process';
import { main } from './main';

export async function startWatcher(serverProcess: ChildProcess) {
    let isRunning = false;
    let rerunScheduled = false;

    function runAnalyzer() {
        if (isRunning) {
            rerunScheduled = true;
            return;
        }
        isRunning = true;
        main()
            .catch(console.error)
            .finally(() => {
                isRunning = false;
                if (rerunScheduled) {
                    rerunScheduled = false;
                    runAnalyzer();
                }
            });
    }

    const watcher = chokidar.watch(
        ['src', 'tests', '**/*.ts', '**/*.tsx'],
        {
            ignored: [
                /(^|[\/\\])\../, // скрытые файлы и папки
                '**/.code-analyzer/**', // игнорировать папку с отчётами
                '**/node_modules/**',
                '**/dist/**',
                '**/build/**',
            ],
            persistent: true,
            ignoreInitial: true,
        }
    );
    let debounceTimer: NodeJS.Timeout | null = null;
    const DEBOUNCE_MS = 10000;

    watcher.on('all', (event, path) => {
        console.log(`\n🔄 File ${event}: ${path}`);
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(runAnalyzer, DEBOUNCE_MS);
    });

    runAnalyzer();

    function shutdown() {
        console.log('\n🛑 Shutting down...');
        watcher.close(); // watcher.close() возвращает Promise, но можно не ждать
        if (serverProcess && typeof serverProcess.kill === 'function') {
            serverProcess.kill();
        }
        process.exit(0);
    }

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}
