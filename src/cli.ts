#!/usr/bin/env node

import { main } from './main';
import { startWatcher } from './watcher';
import { startAnalysisServer } from "./server";

const args = process.argv.slice(2);

startAnalysisServer()
    .then((server) => {
        if (args.includes('--watch')) {
            startWatcher(server).catch(console.error);
        } else {
            main().catch(console.error);
        }
    })
    .catch(console.error);

