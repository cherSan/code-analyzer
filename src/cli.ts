#!/usr/bin/env node

import { join } from "path";
import { main } from './main';
import { startWatcher } from './watcher';
import { startAnalysisServer } from "./server";
import {removeSync} from "fs-extra";

const args = process.argv.slice(2);

const reportDir = join(process.cwd(), '.code-analyzer');
removeSync(reportDir);


startAnalysisServer()
    .then((server) => {
        if (args.includes('--watch')) {
            startWatcher(server).catch(console.error);
        } else {
            main().catch(console.error);
        }
    })
    .catch(console.error);

