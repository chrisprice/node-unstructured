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