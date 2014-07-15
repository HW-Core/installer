/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
var Utils = function() {
};

Utils.run = function(command, endPoints, conf, callback) {
    var installer = require('hw2core-bower');
    var Logger = require('hw2core-bower/node_modules/bower-logger');
    var Q = require('hw2core-bower/node_modules/q');
    var cl = require("hw2core-bower/lib/util/cli");

    var rc = Utils.readJson(conf.cwd + '/.bowerrc');

    rc = Utils.extend({}, conf, rc); // rc more important

    var cmdFunc = installer.commands[command];
    var logger = cmdFunc(endPoints, {save: true}, rc);

    var loglevel;
    var levels = Logger.LEVELS;
    // Set loglevel
    if (installer.config.silent) {
        loglevel = levels.error;
    } else if (installer.config.verbose) {
        loglevel = -Infinity;
        Q.longStackSupport = true;
    } else if (installer.config.quiet) {
        loglevel = levels.warn;
    } else {
        loglevel = levels[installer.config.loglevel] || levels.info;
    }

    var renderer = cl.getRenderer(command, logger.json, installer.config);
    logger.on('end', function(data) {
        if (!installer.config.silent && !installer.config.quiet) {
            renderer.end(data);
        }

        console.log(endPoints + " [OK]");

        if (typeof callback === "function") {
            callback();
        }
    })
            .on('error', function(err) {
                if (levels.error >= loglevel) {
                    renderer.error(err);
                }

                process.exit(1);
            })
            .on('log', function(log) {
                if (levels[log.level] >= loglevel) {
                    renderer.log(log);
                }
            })
            .on('prompt', function(prompt, cb) {
                renderer.prompt(prompt)
                        .then(function(answer) {
                            cb(answer);
                        });
            });

    return;
};

/**
 * Used in crossplatform case to work with forward slashes
 * @returns a path with forward slashes instead back slashes
 */
Utils.getCwd = function() {
    return process.cwd().replace(/\\/g, "/");
};

Utils.processArg = function(arg, consume) {
    var found = false;
    for (var i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === arg) {
            found = true;
            if (consume === true)
                process.argv.splice(i, 1);
        }
    }

    return found;
};

Utils.readJson = function(file) {
    var fs = require("fs");
    var json = {};
    try {
        json = (JSON.parse(fs.readFileSync(file, "utf8")));
    } catch (e) {
        console.log(e);
        process.exit();
    }

    return json;
}

/**
 * 
 * @param target
 * @param sources multiple arguments as source
 * @returns {unresolved}
 */
Utils.extend = function(target/*, sources... */) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function(source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

module.exports = Utils;