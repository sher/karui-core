const c = require('chalk');
const cp = require('child_process');
const path = require('path');
const logger = require('./lib/logger')({ name: 'dist' });
const builder = require('./lib/builder');

start();

async function start() {
    logger.log(c.cyan('start'));

    const settings = {
        dev: false,
        rootPath: path.resolve(__dirname, '../'),
        sourcePath: path.resolve(__dirname, '../src'),
        buildPath: path.resolve(__dirname, '../dist'),
        linkPath: null,
    }

    cp.execSync(`rm -rf ${settings.buildPath}`);
    await builder.start(settings);

    logger.log(c.cyan('done'));
}