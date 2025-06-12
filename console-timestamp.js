function getTime() {
    return new Date().toISOString();
}

['log', 'info', 'warn', 'error', 'debug'].forEach((method) => {
    const original = console[method];
    console[method] = function (...args) {
        original.call(console, `[${getTime()}]`, ...args);
    };
}); 