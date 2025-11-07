import { exec } from 'child_process';
import * as path from 'path';
import chalk from 'chalk';

export async function startAnalysisServer(): Promise<void> {
    return new Promise((resolve) => {
        const serverPath = path.join(__dirname, '..', 'server');
        const reportPath = path.join(process.cwd(), '.code-analyzer', 'report.json');

        console.log(chalk.blue('🚀 Starting Next.js server on http://localhost:3001'));
        console.log(chalk.green(`📊 Report path: ${reportPath}`));

        const command = `cd "${serverPath}" && npx next dev -p 3001`;

        console.log(chalk.gray(`  Running: ${command}`));

        const server = exec(command, {
            env: {
                ...process.env,
                REPORT_PATH: reportPath,
            }
        });

        server.stdout?.on('data', (data) => {
            const message = data.toString();
            console.log(chalk.gray(`[Server] ${message}`));

            if (message.includes('Ready') || message.includes('started')) {
                console.log(chalk.green('✅ Analysis server is running!'));
                console.log(chalk.green('📊 Open http://localhost:3001 to view analysis results'));
            }
        });

        server.stderr?.on('data', (data) => {
            console.error(chalk.red(`[Server Error] ${data}`));
        });

        server.on('close', (code) => {
            console.log(chalk.blue(`Server process exited with code ${code}`));
            resolve();
        });
    });
}