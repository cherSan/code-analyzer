import simpleGit, { SimpleGit, StatusResult } from 'simple-git';
import * as path from 'path';

export class GitUtil {
    private git: SimpleGit;

    constructor() {
        this.git = simpleGit();
    }

    /**
     * Get list of modified files with absolute paths
     */
    async getModifiedFiles(): Promise<string[]> {
        try {
            const status: StatusResult = await this.git.status();

            const modifiedFiles = [
                ...status.modified,
                ...status.not_added, // untracked files
                ...status.created,
                ...status.renamed.map(r => r.to), // in renamed we have from and to
                ...status.deleted
            ];

            // Convert to absolute paths
            const absolutePaths = modifiedFiles.map(file =>
                path.resolve(process.cwd(), file)
            );

            console.log(`📝 Found ${modifiedFiles.length} modified files`);
            return absolutePaths;
        } catch (error) {
            console.error('❌ Error getting git status:', error);
            return [];
        }
    }

    /**
     * Check if we're in git repository
     */
    async isGitRepository(): Promise<boolean> {
        try {
            await this.git.status();
            return true;
        } catch {
            return false;
        }
    }
}