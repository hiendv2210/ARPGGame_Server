/**
 * Created with JetBrains WebStorm.
 * User: dangvanhien
 * Date: 1/9/14
 * Time: 10:30 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Created with JetBrains WebStorm.
 * User: dangvanhien
 * Date: 1/9/14
 * Time: 10:27 AM
 * To change this template use File | Settings | File Templates.
 */

var Mode = function(opts) {
    this.hp2000 = opts.hp2000;
    this.hp5000 = opts.hp5000;
    this.revive = opts.revive;
    this.unlock = opts.unlock;
    this.anatoxic = opts.anatoxic;
};

module.exports = Mode;

var pro = Mode.prototype;