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

        var init = !fs.existsSync(utils.getCwd() + "/bower.json");

        var bowerrc = {
            directory: './'
        };

        var outputFilename = '.bowerrc';

        if (!fs.existsSync(outputFilename)) {
            var err = fs.writeFileSync(outputFilename, JSON.stringify(bowerrc, null, 4));
            console.log(err || "bowerrc created");
        } else if (init) {
            console.log("WARNING: bowerrc already exits in this folder!");
        }

        installer = require('hw2core-bower');
        inquirer = require('hw2core-bower/node_modules/inquirer');

        if (init) {
            console.log("Insert your project specifications:");
            installer.commands.init({"directory": utils.getCwd(), "interactive": true}).on('end', function(data) {
                that.runCommand();
            }).on('prompt', function(prompts, callback) {
                inquirer.prompt(prompts, callback);
            });
        } else {
            that.runCommand();
        }
    };

    this.runCommand = function() {
        if (!utils.processArg("--save-dev"))
            utils.pushArgs(["--save", "--config.interactive"]);

        var path = __dirname + "/../node_modules/.bin/hw2-bower";
        var child_process = require('child_process');
        
        // set stdio and customFds for colored logs in *nix and win
        var child=child_process.spawn(path, process.argv.slice(2),
                {cwd: process.cwd(), stdio: "inherit", customFds: [0,1,2]});
        
        // we can't use this beacause when custom file descriptors are specified, 
        // the streams are literally set to null and are completely inaccessible from the parent.
        
        /*child.stdout.on("data", function (data) {
            console.log(data);
        });

        child.stderr.on("data", function(data) {
            console.log(data);
        });

        child.on("exit", function(code) {
            console.log(code);
        }); */
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