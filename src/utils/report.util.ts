import { v4 as uuidv4 } from 'uuid';
import {ensureDirSync, pathExistsSync, readJSONSync, writeJSONSync} from "fs-extra";
import { join, dirname } from "path";
import { FileReport, MainReport, SummaryReport } from '../types/analyzer.types';

export class ReportUtil {
    private readonly reportDir: string;
    private readonly reportPath: string;
    private readonly summaryPath: string;

    constructor() {
        this.reportDir = join(process.cwd(), '.code-analyzer');
        this.reportPath = join(this.reportDir, 'report.json');
        this.summaryPath = join(this.reportDir, 'summary.json');
    }

    private generateUniquePath(): string {
        const uniqueId = uuidv4();
        return join(this.reportDir, `${uniqueId}.json`);
    }

    private saveMainReport(report: MainReport = {}) {
        ensureDirSync(dirname(this.reportPath));
        writeJSONSync(this.reportPath, report, { spaces: 2 });
    }

    private getMainReport(): MainReport {
        const isExist = pathExistsSync(this.reportPath);
        if (!isExist) this.saveMainReport({});
        return readJSONSync(this.reportPath);
    }

    cleanUpMainReport(changedFiles: string[]): void {
        const mainReport = this.getMainReport();
        const newReport: MainReport = {};
        changedFiles.forEach(file => {
            if (!mainReport[file]) {
                const filePath = this.generateUniquePath();
                newReport[file] = filePath;
                writeJSONSync(filePath, {});
            } else {
                newReport[file] = mainReport[file];
            }
        });
        if (JSON.stringify(newReport) !== JSON.stringify(mainReport)) this.saveMainReport(newReport);
    }

    saveFileReport(originalFile: string, report: FileReport) {
        const mainReport = this.getMainReport();
        if (!mainReport[originalFile] || !pathExistsSync(mainReport[originalFile])) {
            const filePath = this.generateUniquePath();
            mainReport[originalFile] = filePath;
            this.saveMainReport(mainReport);
            writeJSONSync(filePath, report);
        } else {
            const oldReport = readJSONSync(mainReport[originalFile]);
            if (JSON.stringify(oldReport) !== JSON.stringify(report)) writeJSONSync(mainReport[originalFile], report, {spaces: 2});
        }
    }

    saveSummary(report: SummaryReport) {
        const exist = pathExistsSync(this.summaryPath);
        if (!exist) {
            writeJSONSync(this.summaryPath, report);
        } else {
            const oldReport = readJSONSync(this.summaryPath);
            if (JSON.stringify(oldReport) !== JSON.stringify(report)) writeJSONSync(this.summaryPath, report);
        }
    }
}
