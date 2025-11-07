import { coreRules } from './core.rules';
import { stylisticRules } from './stylistic.rules';
import { es6Rules } from './es6.rules';
import { typescriptRules } from './typescript.rules';
import { reactRules } from './react.rules';

export const esLintRules = {
    ...coreRules,
    ...stylisticRules,
    ...es6Rules,
    ...typescriptRules,
    ...reactRules
};