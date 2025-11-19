import { existsSync } from 'fs';
import { join } from 'path';
import type { Config } from './types/config.types';

export function loadProjectConfig(): Config {
    const configPath = join(process.cwd(), 'code-analyzer.config.cjs');

    if (!existsSync(configPath)) {
        console.warn(`⚠️  Code Analyzer config not found at ${configPath}. Using defaults.`);
        return {};
    }

    return require(configPath) as Config;
}