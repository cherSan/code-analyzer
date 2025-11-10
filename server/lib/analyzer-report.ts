import {AnalysisReport, FileAnalysis} from "@/types/analyzer.types";
import {pathExists, readJson} from "fs-extra";
import {readFileSync} from "fs";

export const retrieveAnalyticData: () => Promise<AnalysisReport | null> = async () => {
    console.log('Loading analysis report...', process.env.REPORT_PATH);
    try {
        const reportPath = process.env.REPORT_PATH;

        if (!reportPath) {
            console.log('REPORT_PATH environment variable not set');
            return null;
        }
        if (await pathExists(reportPath)) {
            const reportData = await readJson(reportPath);
            console.log('Report loaded successfully');
            return reportData as AnalysisReport;
        }

        console.log('Report file not found at specified path');
        return null;
    } catch (error) {
        console.error('Error loading analysis:', error);
        return null;
    }
};

export const retrieveFileAnalyticData: (id: number) => Promise<FileAnalysis | null> = async (id?: number) => {
    if (typeof id !== 'number' || isNaN(id)) return null;
    const data = await retrieveAnalyticData();
    if (data && data.files[id])  return data.files[id] || null;
    return null;
}

export const getFileContent: (fileName?: string) => string | null = (fileName?: string) => {
    if (!fileName) return null;
    try {
        return readFileSync(fileName, 'utf-8');
    } catch (error) {
        return null;
    }
}