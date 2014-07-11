/*
 * Copyright (C) 2007 - 2014 Hyperweb2 All rights reserved.
 * GNU General Public License version 3; see www.hyperweb2.com/terms/
 */

var Git = function() {
};

var exec = require('child_process').exec,
        fs = require('fs'),
        util = require('util'),
        events = require('events'),
        emitter = new events.EventEmitter();

// Configure the emitter to print messages to the console, and to exit if we
// run into a severe condition.
emitter
        .on('info', console.info)
        .on('error', console.error)
        .on('severe', function(err) {
            console.error(err);
            process.exit(1);
        });

// Used by exec to print the result of executing a subprocess.

Git.cb = function(callback) {
    return function(error, stdout, stderr) {
        if (error) {
            emitter.emit('error', error);
        } else {
            emitter.emit('info', stdout.trim());
            if (stderr) {
                emitter.emit('error', stderr.trim());
            }

            callback();
        }
    };
};

Git.installWithGit = function(repo, folder, callback) {
    fs.exists(folder + "/.git", Git.create_worker(folder, repo, callback));
};

// Performs a git pull in the given git directory.
Git.git_pull = function(gitdir, callback) {
    exec(util.format('git --git-dir=%s/.git pull', gitdir), Git.cb(callback));
};

// Performs a git clone of the given URL into the given directory.
Git.git_clone = function(url, dir, callback) {
    exec(util.format('git clone %s %s', url, dir), Git.cb(callback));
};


Git.create_worker = function(gitdir, clone_url, callback) {
    return function(exists) {
        if (exists) {
            emitter.emit('info', util.format('%s exists, will pull.', gitdir));
            Git.git_pull(gitdir, callback);
        } else {
            emitter.emit('info', util.format('%s does not exist, will clone from %s.', gitdir, clone_url));
            Git.git_clone(clone_url, gitdir, callback);
        }
    };
};

module.exports = Git;