/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */
var Utils = function() {
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

Utils.pushArgs = function(args) {
    for (var arg in args) {
        arg = args[arg];
        if (!this.processArg(arg, false))
            process.argv.push(arg);
    }
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