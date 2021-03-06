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
var async = require('async');
var acorn = require('acorn');
var path = require('path');
var read = require('../util/read');

module.exports = function (sourceFolders, module, cb) {

  module.relativePath = module.name.split('.').join(path.sep) + '.js';

  read(sourceFolders, module.relativePath, function(error, absolutePath, source) {

    if (error) {
      return cb(error);
    }

    if (absolutePath) {
      module.absolutePath = absolutePath;
      module.source = source;
      module.ast = acorn.parse(source, { ranges:true });
    }

    return cb(undefined, module);

  });

};


