const fs = require('fs');
const pad = require('pad');
const path = require('path');
const chalk = require('chalk');

exports.logger = logger;
exports.ensureDirectoryExists = ensureDirectoryExists;

const loggerInstances = {};

function logger({ name }) {
    if (loggerInstances[name]) {
        return loggerInstances[name];
    }

    const instance = {
        name,
        log() {
            const args = Array.prototype.slice.call(arguments);
            const name = pad(7, this.name);
            const msg = args.join(' ');
            const row = `${chalk.gray(name + ':')} ${msg}`;
            console.log(row);
        }
    }

    loggerInstances[name] = instance;
    return instance;
}

const utilsLogger = logger({ name: 'utils' });

function ensureDirectoryExists(filepath, basePath = null) {
    basePath = basePath ? basePath === '/' ? process.cwd() : basePath : process.cwd();

    let dirname = path.dirname(filepath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExists(dirname);
    fs.mkdirSync(dirname);

    const relDirname = path.relative(basePath, dirname);
    utilsLogger.log(chalk.blue(pad('mkdir', 5)), relDirname);
}