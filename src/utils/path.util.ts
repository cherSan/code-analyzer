import * as path from 'path';

export class PathUtil {
    static getAnalyzerPath(filePath: string): string {
        const normalizedPath = filePath.replace(/^\//, '');
        return path.join('.code-analyzer', normalizedPath);
    }

    static getRelativePath(filePath: string): string {
        return path.relative(process.cwd(), filePath);
    }
}