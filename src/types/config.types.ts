import {Linter} from "eslint";
import prettier from "prettier";

export interface Config {
    eslint?: Linter.Config;
    prettier?: prettier.Options;
    jest?: any;
}