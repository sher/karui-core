'use strict';

const fs = require('fs');
const pad = require('pad');
const path = require('path');
const chalk = require('chalk');
const yargs = require('yargs');
const rimraf = require('rimraf');
const chokidar = require('chokidar');
const pkg = require('../package.json');
const utils = require('../utils');
const logger = utils.logger({ name: 'dev' });

const argv = yargs.argv
const PACKAGE_ROOT = process.cwd();

start();

async function start() {
    logger.log(chalk.green('start'));

    const linkPath = checkLinkPath(argv.link);
    if (!linkPath) return logger.log(chalk.red(`Error: no --link path provided`));

    cleanupLinkPath({ linkPath });

    process.on('exit', cleanupLinkPath.bind(null, { linkPath, exit: true }));
    process.on('SIGINT', cleanupLinkPath.bind(null, { linkPath, exit: true }));
    process.on('SIGTERM', cleanupLinkPath.bind(null, { linkPath, exit: true }));
    process.on('SIGUSR1', cleanupLinkPath.bind(null, { linkPath, exit: true }));
    process.on('SIGUSR2', cleanupLinkPath.bind(null, { linkPath, exit: true }));

    const binaries = {};

    for (const binary in pkg.bin) {
        if (pkg.bin.hasOwnProperty(binary)) {
            let binPath = path.relative(PACKAGE_ROOT, pkg.bin[binary]);
            binaries[binPath] = binary;
        }
    }

    const targetPath = path.join(linkPath, 'node_modules', pkg.name);
    utils.ensureDirectoryExists(path.join(targetPath, 'index.js'), PACKAGE_ROOT); // creates target folder

    const linker = chokidar.watch('.', { ignored: ['./node_modules', './scripts', /(^|[/\\])\../] });

    linker.on('all', async (event, destPath) => {
        let relPath = path.relative(PACKAGE_ROOT, destPath);
        let copyPath = path.resolve(targetPath, relPath);
        utils.ensureDirectoryExists(relPath, copyPath);
        fs.copyFileSync(destPath, copyPath);

        logger.log(chalk.blue(pad('copy', 5)), chalk.white(relPath), chalk.blue('→'), chalk.magenta(copyPath));

        if (binaries[destPath]) {
            let binaryLinkPath = path.join(linkPath, 'node_modules', '.bin', binaries[destPath]);
            if (fs.existsSync(binaryLinkPath)) {
                fs.unlinkSync(binaryLinkPath);
            }
            fs.symlinkSync(path.relative(path.dirname(binaryLinkPath), copyPath), binaryLinkPath);
            fs.chmodSync(copyPath, '0755');
            logger.log(chalk.blue(pad('link', 5)), chalk.white(copyPath), chalk.blue('→'), chalk.magenta(binaryLinkPath));
        }
    });

    linker.on('ready', async () => {
        logger.log(chalk.green('ready'));
    });
}

function checkLinkPath(link) {
    if (!link) return false;
    let linkPath = path.resolve(PACKAGE_ROOT, link);

    if (!fs.existsSync(linkPath)) {
        logger.log(chalk.yellow(`warning: link path ${linkPath} does not exist`));
        return null;
    }

    let stats = fs.statSync(linkPath);

    if (!stats.isDirectory()) {
        logger.log(chalk.yellow(`warning: link path must be a directory, provided ${linkPath}`));
        return null;
    }

    return linkPath;
}

let cleaningup = false;

function cleanupLinkPath({ linkPath, exit }) {
    if (exit) {
        if (cleaningup) {
            return;
        }
        cleaningup = true;
        logger.log(chalk.blue('cleanup'));
    }

    for (const binary in pkg.bin) {
        if (pkg.bin.hasOwnProperty(binary)) {
            let unlinkPath = path.join(linkPath, 'node_modules', '.bin', binary);
            if (fs.existsSync(unlinkPath)) {
                logger.log(chalk.blue('unlink'), chalk.gray(unlinkPath));
                fs.unlinkSync(unlinkPath);
            }
        }
    }

    let targetPath = path.join(linkPath, 'node_modules', pkg.name);
    if (fs.existsSync(targetPath)) {
        logger.log(chalk.blue('rmdir'), chalk.gray(targetPath));
        rimraf.sync(targetPath);
    }

    if (exit) {
        return process.exit();
    }
}
