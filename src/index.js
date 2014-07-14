/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */


var Installer = function() {
    var Q = require('hw2core-bower/node_modules/q');
    var utils = require('./utils.js');
    var git = require('./git.js');
    var fs = require('fs');
    var inquirer = require('hw2core-bower/node_modules/inquirer');
    var cl = require("hw2core-bower/lib/util/cli");
    var installer = require('hw2core-bower');
    var Logger = require('hw2core-bower/node_modules/bower-logger');

    this.installRoot = function() {
        var path = utils.getCwd();
        this.appName = path.substring(path.lastIndexOf('/') + 1, path.length);
        if (this.appName.isEmpty()) // if we are on system root folder "/" , we've to force an appname
            this.appName = "yourapp";
        else
            process.chdir("../");

        git.installWithGit("git://github.com/hw2-core/root.git", utils.getCwd() + "/" + this.appName, this.installDirs.bind(this));
        //install([appName + "=git://github.com/hw2-core/root.git"], {"cwd": getCwd(), "directory": "./"}, installShare);
    };

    this.installDirs = function() {
        var that = this;

        fs.exists(this.appName + "/bower.json", function(exists) {
            if (!exists) {
                installer.commands.init({"directory": "./", "interactive": true}).on('end', function(data) {
                    that.installLocal();
                }).on('prompt', function(prompts, callback) {
                    inquirer.prompt(prompts, callback);
                });
            } else {
                that.installLocal();
            }

        });
    };

    this.installLocal = function() {
        utils.install(["local=git://github.com/hw2-core/directory-structure.git"], {"cwd": "./" + this.appName}, this.installShare.bind(this));
    };

    this.installShare = function() {
        utils.install(["share=git://github.com/hw2-core/directory-structure.git"], {"cwd": "./" + this.appName}, this.runCommand.bind(this));
    };

    this.runCommand = function() {
        var dir;

        var options = cl.readOptions({
            'force-latest': {type: Boolean, shorthand: 'F'},
            'production': {type: Boolean, shorthand: 'p'},
            'save': {type: Boolean, shorthand: 'S'},
            'save-dev': {type: Boolean, shorthand: 'D'}
        }, process.argv);

        if (utils.processArg("-l", true) || utils.processArg("--local", true)) {
            dir = "local";
        } else {
            dir = "share";
        }

        var cwd = process.cwd()+"/"+this.appName + "/" + dir;
        var rc = utils.readJson(cwd + '/.bowerrc');

        rc.cwd = cwd;
        rc.interactive = true;

        utils.createJson(this.appName, dir, function() {
            var endPoints = options.argv.remain.slice(1);
            var cmd = options.argv.remain[0];
            var cmdFunc = installer.commands[cmd];

            var logger=cmdFunc(endPoints, {save: true}, rc)
            
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
                        
            var renderer = cl.getRenderer(cmd, logger.json, installer.config);
            logger.on('end', function (data) {
                if (!installer.config.silent && !installer.config.quiet) {
                    renderer.end(data);
                }
            })
            .on('error', function (err)  {
                if (levels.error >= loglevel) {
                    renderer.error(err);
                }
        
                process.exit(1);
            })
            .on('log', function (log) {
                if (levels[log.level] >= loglevel) {
                    renderer.log(log);
                }
            })
            .on('prompt', function (prompt, callback) {
                renderer.prompt(prompt)
                .then(function (answer) {
                    callback(answer);
                });
            });
        });
    };

    this.help = function() {
        process.stdout.write("\
    This programm will create hw2core folder structure \n\
    if doesn't exist and installs/updates modules for hw2core \n\
    Commands:\n\
        install\n\
        update\n\
        uninstall\n\
        link\n\
    Options:\n\
        -l, --local\n\
        -p, --production\n\
    \n"
                );
    };
};


module.exports = Installer;