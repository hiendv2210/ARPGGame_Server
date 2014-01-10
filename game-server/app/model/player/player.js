/**
 * Created with JetBrains WebStorm.
 * User: dangvanhien
 * Date: 1/9/14
 * Time: 10:27 AM
 * To change this template use File | Settings | File Templates.
 */

var Mode = function(opts) {
    this.id = opts.id;
    this.kougeki = opts.kougeki;
    this.hp = opts.hp;
    this.current_hp = opts.current_hp;
    this.gauge = opts.gauge;
    this.currentGauge = opts.currentGauge;
    this.level = opts.level;
    this.name = opts.name;
    this.attribute = opts.attribute;
};

module.exports = Mode;

var pro = Mode.prototype;

pro.getName = function(){
    return this.name;
}

