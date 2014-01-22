/**
 * Created with JetBrains WebStorm.
 * User: dangvanhien
 * Date: 1/9/14
 * Time: 10:27 AM
 * To change this template use File | Settings | File Templates.
 */
var Item = require("../item/item");
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
    this.isLock = opts.isLock;
    this.lockCount = opts.lockCount;
    this.isPoisoned = opts.isPoisoned;
    this.poisonCount = opts.poisonCount;
    this.isAttackable = true;
    this.target = opts.target;
    this.uid = opts.uid;

    this.item = new Item(opts.item);
    this.updateStage = false;


    this.isDie = false;
};

module.exports = Mode;

var pro = Mode.prototype;

pro.getName = function(){
    return this.name;
}


pro.updatePlayerInfo = function( playerInfo){
    this.kougeki = playerInfo.kougeki;
    this.current_hp = playerInfo.current_hp;
    this.currentGauge = playerInfo.current_gauge;
    this.level = playerInfo.level;
    this.attribute = playerInfo.attribute;
    this.isLock = playerInfo.isLock;
    this.lockCount = playerInfo.lockCount;
    this.isPoisoned = playerInfo.isPoison;
    this.poisonCount = playerInfo.poisonCount;

}


pro.setAttackAble = function(attackAbe){
    this.isAttackable = attackAbe;
}

pro.getAttackAble = function(){
    return this.isAttackable;
}

pro.getCurrentHP = function(){
    return this.current_hp;
}

pro.getID = function(){
    return this.id;
}

pro.updateTarget = function( targetName ){
    this.target = targetName;
}

pro.getUID = function(){
    return this.uid;
}


pro.reduceItem = function(typeItem){
    this.item.reduceNumberItem(typeItem);
}

pro.setIsLock = function( isLock){
    this.isLock = isLock;
}

pro.setIsPoison = function( isPoison){
    this.isPoisoned = isPoison;
}


pro.getTarget = function(){
    return this.target;
}

pro.getUpdateStage = function(){
    return this.updateStage;
}

pro.setUpdateStage = function(isUpdate){
    this.updateStage = isUpdate;
}

pro.useItem = function(type){
    this.item.reduceNumberItem(type);
}

pro.addItemEffect = function(type){

    switch(type){
        case 1:
            this.current_hp += 2000;
            if(this.current_hp > this.hp) this.current_hp = this.hp;
            break;
        case 2:
            this.current_hp += 5000;
            if(this.current_hp > this.hp) this.current_hp = this.hp;
            break;
        case 3:
            this.current_hp = this.hp;
            break;
        case 4:
            this.isPoisoned = false;
            this.poisonCount = 0;
            break;
        case 5:
            this.isPoisoned = false;
            this.poisonCount = 0;
            break;
    }
}

pro.getIsLock = function(){
    return this.isLock;
}


pro.updateInfoFromClient = function(currenthp,currentGaue,kougeki){
    this.current_hp = currenthp;
    this.currentGauge = currentGaue;
    this.kougeki = kougeki;
}


pro.updateDieStatus = function(die){
    this.isDie =  die;
    this.current_hp = 0;
}

pro.getStatusDie = function(){
    return this.isDie;
}

pro.updateCurrentHP = function(valueHP){
    this.current_hp = valueHP;
}



