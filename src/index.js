/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */


var Installer = function() {
    var utils = require('./utils.js');
    var git = require('./git.js');
    var fs = require('fs');
    var inquirer = require('hw2core-bower/node_modules/inquirer');
    var cl = require("hw2core-bower/lib/util/cli");
    var installer = require('hw2core-bower');

    this.installRoot = function() {
        git.installWithGit("git://github.com/hw2-core/directory-structure.git", utils.getCwd(), this.initProject.bind(this));
    };

    this.initProject = function() {
        var that = this;

        fs.exists(utils.getCwd() + "/bower.json", function(exists) {
            if (!exists) {
                console.log("Insert your project specifications:");
                installer.commands.init({"directory": "./", "interactive": true}).on('end', function(data) {
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
        var options = cl.readOptions({
            'force-latest': {type: Boolean, shorthand: 'F'},
            'production': {type: Boolean, shorthand: 'p'},
            'save': {type: Boolean, shorthand: 'S'},
            'save-dev': {type: Boolean, shorthand: 'D'}
        }, process.argv);

        var conf = {};
        conf.cwd = utils.getCwd();
        conf.interactive = true;

        // TODO merge command line confs

        var endPoints = options.argv.remain.slice(1);
        var cmd = options.argv.remain[0];

        utils.run(cmd, endPoints, conf);
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