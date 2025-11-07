import simpleGit, { SimpleGit, StatusResult } from 'simple-git';

export class GitUtil {
    private git: SimpleGit;

    constructor() {
        this.git = simpleGit();
    }

    async getModifiedFiles(): Promise<string[]> {
        try {
            const status: StatusResult = await this.git.status();

            const modifiedFiles = [
                ...status.modified,
                ...status.not_added,
                ...status.created,
                ...status.renamed.map(r => r.to),
                ...status.deleted
            ];

            console.log(`📝 Found ${modifiedFiles.length} modified files`);
            return modifiedFiles;
        } catch (error) {
            console.error('❌ Error getting git status:', error);
            return [];
        }
    }
    async isGitRepository(): Promise<boolean> {
        try {
            await this.git.status();
            return true;
        } catch {
            return false;
        }
    }
}