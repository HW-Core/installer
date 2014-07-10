var fs = require('fs');
var inquirer = require('inquirer');

String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

if (consumeArg("--help")) {
    help();
    process.exit();
}

var cl = require("hw2core-bower/lib/util/cli");
var installer = require('hw2core-bower');

installRoot();

function installRoot() {
    var path = process.cwd();
    appName = path.substring(path.lastIndexOf('/') + 1, path.length);
    if (appName.isEmpty()) // if we are on system root folder "/" , we've to force an appname
        appName = "yourapp";
    else
        process.chdir("../");
    
    install([appName + '=git@github.com:hw2-core/root.git'], {"cwd": process.cwd(),"directory": "./"}, installDirs);
}

function installDirs() {
    fs.exists(appName+"/bower.json", function(exists) {
        if (!exists) {
            installer.commands.init({"directory": "./", "interactive": true}).on('end', function(data) {
                installLocal();
            }).on('prompt', function(prompts, callback) {
                inquirer.prompt(prompts, callback);
            });
        } else {
            installLocal();
        }

    });
}

function installLocal() {
    install(["local=git@github.com:hw2-core/directory-structure.git"], {"cwd": "./" + appName, "directory": "./"}, installShare);
}

function installShare() {
    install(["share=git@github.com:hw2-core/directory-structure.git"], {"cwd": "./" + appName, "directory": "./"}, runCommand);
}

function runCommand() {
    var dir;

    var options = cl.readOptions({
        'force-latest': {type: Boolean, shorthand: 'F'},
        'production': {type: Boolean, shorthand: 'p'},
        'save': {type: Boolean, shorthand: 'S'},
        'save-dev': {type: Boolean, shorthand: 'D'}
    }, process.argv);

    if (consumeArg("-l") || consumeArg("--local")) {
        dir = "local";
    } else {
        dir = "share";
    }

    createJson(dir, function() {
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
}


/**
 * 
 * @param {type} endPoints
 * @param {type} conf
 * @param {type} callback
 * @returns {undefined}UTILS 
 */

function install(endPoints, conf, callback) {
    installer.commands.install(endPoints, {save: true}, conf).on('end', function(installed) {
        console.log(endPoints + " [OK]");

        if (typeof callback === "function") {
            callback();
        }
    });

    return;
}

function createJson(folder, callback) {
    var outputFilename = appName+"/"+folder + '/bower.json';
    
    fs.exists(outputFilename, function(exists) {
        if (!exists) {

            var data = {
                name: folder,
                description: "just a container for dependencies",
                version: '0'
            };


            fs.writeFile(outputFilename, JSON.stringify(data, null, 4), function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("New bower.json for "+folder+" folder created");
                }
            });
        }

        callback();
    });
}

function consumeArg(arg) {
    var found = false;
    for (var i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === arg) {
            found = true;
            process.argv.splice(i, 1);
        }
    }

    return found;
}

function help() {
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
}

