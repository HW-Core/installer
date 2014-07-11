/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */


var Installer = function() {
    var utils = require('./utils.js');
    var git = require('./git.js');
    var fs = require('fs');
    var inquirer = require('inquirer');
    var cl = require("hw2core-bower/lib/util/cli");
    var installer = require('hw2core-bower');

    this.installRoot = function() {
        var path = utils.getCwd();
        appName = path.substring(path.lastIndexOf('/') + 1, path.length);
        if (appName.isEmpty()) // if we are on system root folder "/" , we've to force an appname
            appName = "yourapp";
        else
            process.chdir("../");

        git.installWithGit("git://github.com/hw2-core/root.git", utils.getCwd() + "/" + appName, this.installDirs.bind(this));
        //install([appName + "=git://github.com/hw2-core/root.git"], {"cwd": getCwd(), "directory": "./"}, installShare);
    };

    this.installDirs = function() {
        var that = this;

        fs.exists(appName + "/bower.json", function(exists) {
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
        utils.install(["local=git://github.com/hw2-core/directory-structure.git"], {"cwd": "./" + appName, "directory": "./"}, this.installShare.bind(this));
    };

    this.installShare = function() {
        utils.install(["share=git://github.com/hw2-core/directory-structure.git"], {"cwd": "./" + appName, "directory": "./"}, this.runCommand.bind(this));
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

        utils.createJson(appName, dir, function() {
            var endPoints = options.argv.remain.slice(1);
            var cmd = options.argv.remain[0];
            var cmdFunc = installer.commands[options.argv.remain[0]];

            cmdFunc(endPoints, {save: true}, {"cwd": appName + "/" + dir, "directory": "./modules", "interactive": true}).on('error', function(err) {
                console.log(err);
                process.exit(1);
            }).on('end', function(data) {
                console.log(cmd + " command executed successfully");
                process.exit();
            }).on('prompt', function(prompt, callback) {
                inquirer.prompt(prompt, callback);
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