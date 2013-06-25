module.exports = function (opts) {

    function resolve(modules) {

        if (!modules) {
            return [];
        }

        modules = modules.map(function (module) {

            if (module._resolved) {
                return [];
            }

            module._resolved = true;

            return resolve(module.dependencies).concat(module);

        });

        return Array.prototype.concat.apply([], modules);

    }

    return {
        resolve:resolve
    };
};