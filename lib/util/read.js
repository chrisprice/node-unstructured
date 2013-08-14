/*!
 unstructured - a library for resolving dependencies in unstructured code
 Copyright (C) 2013  Chris Price

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var fs = require('fs');
var async = require('async');
var path = require('path');

/**
 * Search the sourceFolders in order for a matching relativePath and
 * if found read the contents of the file.
 */
module.exports = function (sourceFolders, relativePath, cb) {

  var possiblePaths = sourceFolders.map(function (sourceFolder) {

    return path.join(sourceFolder, relativePath);

  });

  async.detectSeries(possiblePaths, fs.exists, function (absolutePath) {

    if (!absolutePath) {
      return cb();
    }

    fs.readFile(absolutePath, 'utf8', function (error, content) {

      return cb(error, absolutePath, content);

    });

  });

};