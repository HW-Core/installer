/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
var Utils=function() {};

Utils.install=function(endPoints, conf, callback) {
    var installer = require('hw2core-bower');
    
    installer.commands.install(endPoints, {save: true, force: true}, conf).on('end', function(installed) {
        console.log(endPoints + " [OK]");

        if (typeof callback === "function") {
            callback();
        }
    });

    return;
};

/**
 * Used in crossplatform case to work with forward slashes
 * @returns a path with forward slashes instead back slashes
 */
Utils.getCwd=function() {
    return process.cwd().replace(/\\/g, "/");
};

Utils.createJson=function(appName, folder, callback) {
    var fs=require("fs");
    
    var outputFilename = appName + "/" + folder + '/bower.json';

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
                    console.log("New bower.json for " + folder + " folder created");
                }
            });
        }

        callback();
    });
};

Utils.processArg=function(arg, consume) {
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

module.exports=Utils;