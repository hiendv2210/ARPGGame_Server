/**
 * Created with JetBrains WebStorm.
 * User: dangvanhien
 * Date: 1/9/14
 * Time: 10:19 AM
 * To change this template use File | Settings | File Templates.
 */


var Mode = function(opts) {
    this.name = opts.name;
    this.kougeki = opts.kougeki;
    this.hp = opts.hp;
    this.current_hp = opts.current_hp;
    this.turn = opts.turn;
    this.attribute = opts.attribute;
    this.target = opts.target;
};

module.exports = Mode;

var pro = Mode.prototype;

pro.updateAllInfo = function(opts){
        this.name = opts.name;
        this.kougeki = opts.kougeki;
        this.hp = opts.hp;
        this.current_hp = opts.current_hp;
        this.turn = opts.turn;
        this.attribute = opts.attribute;
        this.target = opts.target;
};

pro.updateTarget = function(targetName){
   this.target = targetName;
};

pro.updateCurrentHP = function(reduceHP){
    this.current_hp -= reduceHP;
    if( this.current_hp <= 0){
        this.current_hp = 0;
    }
};

pro.updateTurn = function(currentTurn){
    this.turn = currentTurn;
};

pro.getName = function(){
    return this.name;
}

