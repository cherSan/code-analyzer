import {retrieveAnalyticData} from "@/lib/analyzer-report";

const LintErrors = async () => {
    const data = retrieveAnalyticData();

    return (
        <div>
            {JSON.stringify(data)}
        </div>
    )
}

export default LintErrors;
