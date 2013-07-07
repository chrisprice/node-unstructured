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
var records = {};

function Record() {
    this.time = null;
    this.sum = 0;
    this.count = 0;
    this.avg = function() {
        return this.sum / this.count;
    };
}

exports.start = function(alias) {
    var record = records[alias];
    if (!record) {
        record = records[alias] = new Record();
    }
    if (record.time) {
        throw 'Already started';
    }
    record.time = process.hrtime();
    return record;
};

exports.stop = function(alias) {
    var record = records[alias];
    if (!record || !record.time) {
        throw 'Not started';
    }
    record.sum += process.hrtime(record.time)[1];
    record.count++;
    record.time = null;
};

exports.next = function(stopAlias, startAlias) {
    exports.stop(stopAlias);
    exports.start(startAlias);
}

exports.log = function(alias) {
    if (!alias) {
        return Object.keys(records).forEach(exports.log);
    }
    var record = records[alias];
    if (!record) {
        throw 'Not found';
    }
    console.log(alias + '(' + record.count + '):', (record.avg() / 1000 / 1000).toFixed(3) + 'ms');
};