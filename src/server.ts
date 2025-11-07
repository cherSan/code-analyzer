import { exec } from 'child_process';
import * as path from 'path';
import chalk from 'chalk';

export async function startAnalysisServer(): Promise<void> {
    return new Promise((resolve) => {
        const serverPath = path.join(__dirname, '..', 'server');

        console.log(chalk.blue('🚀 Starting Next.js server on http://localhost:3001'));
        console.log(chalk.gray(`  Server path: ${serverPath}`));

        const fs = require('fs');
        if (!fs.existsSync(serverPath)) {
            console.error(chalk.red(`❌ Server path not found: ${serverPath}`));
            console.log(chalk.yellow('⚠ Make sure to run "npm run build" first'));
            resolve();
            return;
        }

        const command = `cd "${serverPath}" && npx next start -p 3001`;

        console.log(chalk.gray(`  Running: ${command}`));

        const server = exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(chalk.red('❌ Server error:'), error.message);
            }
            if (stderr) {
                console.error(chalk.red('❌ Server stderr:'), stderr);
            }
            if (stdout) {
                console.log(chalk.blue('Server stdout:'), stdout);
            }
        });

        server.stdout?.on('data', (data) => {
            console.log(chalk.gray(`[Server] ${data}`));
        });

        server.stderr?.on('data', (data) => {
            console.error(chalk.red(`[Server Error] ${data}`));
        });

        server.on('close', (code) => {
            console.log(chalk.blue(`Server process exited with code ${code}`));
            resolve();
        });

        setTimeout(() => {
            console.log(chalk.green('✅ Analysis server is running!'));
            console.log(chalk.green('📊 Open http://localhost:3001 to view analysis results'));
            console.log(chalk.gray('Press Ctrl+C to stop the server'));
        }, 5000);
    });
}