import {pathExistsSync, readJSONSync} from "fs-extra";
import {join} from 'path';
import {FileReport, MainReport, SummaryReport} from "@/types/analyzer.types";

export const retrieveAnalyticData: () => MainReport = () => {
    if (!process.env.REPORT_PATH) return {};
    const reportPath = join(process.env.REPORT_PATH, 'report.json');
    const isExist = pathExistsSync(reportPath);
    if (!isExist) return {};
    return readJSONSync(reportPath) || {};
};

export const retrieveFileAnalyticData: (path: string) => FileReport = (path: string) => {
    const isExist = pathExistsSync(path);
    if (!isExist) return {};
    return readJSONSync(path) || {};
}

export const retrieveSummary: () => SummaryReport = () => {
    if (!process.env.REPORT_PATH) return {};
    const reportPath = join(process.env.REPORT_PATH, 'summary.json');
    const isExist = pathExistsSync(reportPath);
    if (!isExist) return {};
    return readJSONSync(reportPath) || {};
}
