/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */


var Installer = function() {

    var utils = require('./utils.js');
    var fs = require('fs');
    var installer;
    var inquirer;

    this.initProject = function() {
        var that = this;

        var bowerrc = {
            directory: './'
        };

        var outputFilename = '.bowerrc';

        fs.writeFile(outputFilename, JSON.stringify(bowerrc, null, 4), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("bowerrc created");

                installer = require('hw2core-bower');
                inquirer = require('hw2core-bower/node_modules/inquirer');

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
            }
        });
    };

    this.runCommand = function() {
        if (!utils.processArg("--save-dev"))
            utils.pushArgs(["--save", "--config.interactive"]);

        var path = __dirname + "/../node_modules/.bin/hw2-bower";
        var child_process = require('child_process');
        child_process.execFile(path,process.argv.slice(2),
                {cwd: process.cwd()}, function(error, stdout, stderr) {
            console.log('Installing module...');

            if (stderr !== null) {
                console.log('' + stderr);
            }
            if (stdout !== null) {
                console.log('' + stdout);
            }
            if (error !== null) {
                console.log('' + error);
            }
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
            Options:\n\
                -p, --production\n\
        \n");
    };
};


module.exports = Installer;