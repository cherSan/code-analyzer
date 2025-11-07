import { spawn } from 'child_process';
import * as path from 'path';
import chalk from 'chalk';

export async function startAnalysisServer(): Promise<void> {
    return new Promise((resolve) => {
        const serverPath = path.join(__dirname, 'server');

        console.log(chalk.blue('🚀 Starting Next.js server on http://localhost:3001'));

        const server = spawn('npx', ['next', 'dev', '-p', '3001'], {
            cwd: serverPath,
            stdio: 'inherit',
            shell: true
        });

        server.on('close', (code) => {
            console.log(chalk.blue(`Server process exited with code ${code}`));
            resolve();
        });

        setTimeout(() => {
            console.log(chalk.green('✅ Analysis server is running!'));
            console.log(chalk.green('📊 Open http://localhost:3001 to view analysis results'));
        }, 3000);
    });
}