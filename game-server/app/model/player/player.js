/**
 * Created with JetBrains WebStorm.
 * User: dangvanhien
 * Date: 1/9/14
 * Time: 10:27 AM
 * To change this template use File | Settings | File Templates.
 */

/*var Mode = function() {
    this.id = opts.id;
    this.kougeki = opts.kougeki;
    this.hp = opts.hp;
    this.current_hp = opts.current_hp;
    this.gauge = opts.gauge;
    this.currentGauge = opts.currentGauge;
    this.level = opts.level;
    this.name = opts.name;
    this.attribute = opts.attribute;
}; */
var Mode = function(id) {
    console.log("Create Player");
    this.id = id;
    this.kougeki = 0;
    this.hp = 0;
    this.current_hp = 0;
    this.gauge = 0;
    this.currentGauge = 0;
    this.level = 0;
    this.name = 0;
    this.attribute = 0;
};

module.exports = Mode;

var pro = Mode.prototype;

pro.updateInfo = function(info){

    this.id = info.id;
    this.kougeki = info.kougeki;
    this.hp = info.hp;
    this.current_hp = info.current_hp;
    this.gauge = info.gauge;
    this.currentGauge = info.currentGauge;
    this.level = info.level;
    this.name = info.name;
    this.attribute = info.attribute;

}