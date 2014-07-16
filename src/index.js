/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */


var Installer = function() {
    var utils = require('./utils.js');
    var git = require('./git.js');
    var fs = require('fs');
    var installer = require('hw2core-bower');
    var inquirer = require('hw2core-bower/node_modules/inquirer');
    var cl = require("hw2core-bower/lib/util/cli");

    this.installRoot = function() {
        var options = cl.readOptions({}, process.argv);
        var cmd = options.argv.remain[0];

        git.installWithGit("git://github.com/hw2-core/directory-structure.git", utils.getCwd(), this.initProject.bind(this), cmd == "update" || null);
    };

    this.initProject = function() {
        var that = this;

        fs.exists(utils.getCwd() + "/bower.json", function(exists) {
            if (!exists) {
                console.log("Insert your project specifications:");
                installer.commands.init({"directory": utils.getCwd(), "interactive": true}).on('end', function(data) {
                    that.runCommand();
                }).on('prompt', function(prompts, callback) {
                    inquirer.prompt(prompts, callback);
                });
            } else {
                that.runCommand();
            }
        });
    };

    this.runCommand = function() {
        if (!utils.processArg("--save-dev"))
            utils.pushArgs(["--save", "--config.interactive"]);

        require(__dirname + "/../node_modules/hw2core-bower/bin/hw2-bower.js");
    };

    this.help = function() {
        process.stdout.write("\
    This programm will create hw2core folder structure \n\
    if doesn't exist and installs/updates modules for hw2core \n\
    Commands:\n\
        install\n\
        update\n\
        uninstall\n\
    Options:\n\
        -p, --production\n\
    \n"
                );
    };
};


module.exports = Installer;