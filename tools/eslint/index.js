import noConsoleLog from './rules/no-console-log.js';

export const customRulesPlugin = {
    rules: {
        'no-console-log': noConsoleLog,
    },
};

export {
    noConsoleLog,
};