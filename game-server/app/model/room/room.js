/**
 * Created with JetBrains WebStorm.
 * User: dangvanhien
 * Date: 1/9/14
 * Time: 10:24 AM
 * To change this template use File | Settings | File Templates.
 */

var Player = require("../player/player");
var Boss = require("../boss/boss");

var Room = function(opts) {
    this.boss = [];
    this.player = [];
    this.stage = 1;
    this.type = opts.type;
    this.isStart = false;
};

var RoomDetail = {
    0:[
        {name: "angel_1",hp: 5000, kougeki :1000,attribute:3},
        {name: "angel_2",hp: 5000, kougeki :1000,attribute:3},
        {name: "angel_3",hp: 5000, kougeki :1000,attribute:3}
      ],
    1:[
        {name: "angel_1",hp: 8000, kougeki :500,attribute:1},
        {name: "angel_2",hp: 8000, kougeki :500,attribute:1},
        {name: "angel_3",hp: 8000, kougeki :500,attribute:1}
    ],
    2:[
        {name: "angel_1",hp: 20000, kougeki :700,attribute:1},
        {name: "angel_2",hp: 20000, kougeki :1000,attribute:0},
        {name: "angel_3",hp: 20000, kougeki :700,attribute:2}
    ],
    3:[
        {name: "angel_1",hp: 90000, kougeki :2000,attribute:3}

    ]
}

module.exports = Room;

var pro = Room.prototype;

pro.updateStage = function(){
    this.boss = [];
    this.isStart = true;
    var detail = RoomDetail[this.stage - 1];
    for( var i  = 0 ; i < detail.length ; i ++ ){
          var opts = {};
          opts.name = detail[i].name;
          opts.kougeki = detail[i].kougeki;
          opts.hp = detail[i].hp;
          opts.current_hp =  detail[i].hp;
          opts.turn = Math.floor(Math.random() * 3) + 1;
          opts.attribute = detail[i].attribute;
          opts.target = "";
          var bs = new Boss(opts);
          this.boss[i] = bs;
          this.boss[i].updateSpecailAttack();
    }

    for( var i = 0; i < this.player.length ; i++){
        this.player[i].setUpdateStage(false);

    }

}

pro.getRoomOfBoosInfo = function(){
    return this.boss;
}

pro.getPlayerInfo = function( ){
    return this.player;
}

pro.createPlayer = function( noPlayer , typeWeapon,namePlayer,uid ){

    var opts = {};
    opts.id = noPlayer;
    opts.name = namePlayer;
    if( typeWeapon == 2){

        opts.kougeki = 200;
        //opts.hp = 9999;
        //opts.current_hp = 9999;
        opts.hp = 1000;
        opts.current_hp = 1000;
        opts.gauge = 500;
        opts.currentGauge = 0;
        opts.level = 1;
        opts.attribute = 2;
    }
    else {
        opts.kougeki = 150;
        opts.hp = 9999;
        opts.current_hp = 9999;
        //opts.hp = 1000;
        //opts.current_hp = 1000;
        opts.gauge = 500;
        opts.currentGauge = 0;
        opts.level = 1;
        opts.attribute = 1;
    }
    opts.isLock = false;
    opts.lockCount = 0;
    opts.isPoisoned = false;
    opts.poisonCount = 0;
    opts.uid = uid;
    opts.item = {hp2000:10,hp5000:10,revive:1,unlock:2,anatoxic:2};
    opts.target = this.getBossNameTarget();
    var pl = new Player(opts);

    this.player[noPlayer] = pl;

}

pro.removePlayer = function(noPlayer){
    //console.log(noPlayer);
    //this.player[noPlayer - 1 ] = "";
    if(typeof this.player[noPlayer -1 ] != undefined)
        this.player.splice(noPlayer - 1 ,1);

}

pro.getBossInfoBeforeStartAttack = function(){
    for( var i = 0; i < this.boss.length; i++){
       this.boss[i].updateTarget( this.getPlayerNameTarget());
       this.boss[i].updateSpecailAttack();
       this.boss[i].reduceTurn();
    }
    return this.boss;
}

pro.getPlayerInfoBeforeAttack = function(){

    for( var i = 0; i < this.player.length; i++){
        this.player[i].updateTarget( this.getBossNameTarget());
    }
    return this.player;
}

pro.updateBossCurrentHP = function(bossName,reduceHP){


    for( var i = 0; i < this.boss.length; i++){
        if( this.boss[i].name == bossName){
            this.boss[i].updateCurrentHP(reduceHP);
            break;
        }
    }
}

pro.getPlayerNameTarget = function(){
    var listPlayerAvaiable = [];
    var countPlayer = this.player.length;
    var j = 0;
    for( var i  = 0; i < countPlayer ; i++ ){
       if( this.player[i].getCurrentHP() > 0){
          listPlayerAvaiable[j] = this.player[i];
          j++;
       }
    }

    if( listPlayerAvaiable.length > 0){
        var rd = Math.floor(Math.random() * listPlayerAvaiable.length );
        return listPlayerAvaiable[rd].getID();
    }

    return "";
}

pro.getBossNameTarget = function(){

    var listBossAvaiable = [];
    var countPlayer = this.boss.length;
    var j = 0;
    for( var i  = 0; i < countPlayer ; i++ ){
        if( this.boss[i].getCurrentHP() > 0){
            listBossAvaiable[j] = this.boss[i];
            j++;
        }
    }
    if( listBossAvaiable.length > 0){
        var rd = Math.floor(Math.random() * listBossAvaiable.length );
        return listBossAvaiable[rd].getName();
    }
    return "";
}

pro.updatePlayerInfo = function(noPlayer, playerInfo){
    if(typeof this.player[noPlayer] != undefined)
          this.player[noPlayer].updatePlayerInfo(playerInfo);
}

pro.updateAttackAbleAllPlayer = function(attackAble){
    var countPlayer = this.player.length;
    for( var i  = 0; i < countPlayer ; i++ ){
        if( this.player[i].getCurrentHP() > 0 ){
            this.player[i].setAttackAble(attackAble);
        }
        else this.player[i].setAttackAble(false);
    }


}

pro.updateAttackAblePlayer = function(noPlayer,attackAble){
    if(typeof this.player[noPlayer] != undefined){
        if( this.player[noPlayer].getCurrentHP() > 0 ){
            this.player[noPlayer].setAttackAble(attackAble);
        }
        else this.player[noPlayer].setAttackAble(false);
    }



}

pro.checkStartPlayerAttack = function(){
    var countPlayer = this.player.length;
    for( var i  = 0; i < countPlayer ; i++ ){
        if( this.player[i].getCurrentHP() > 0 && !this.player[i].getAttackAble() ){
            return false;
        }
    }
    return true;
}

pro.checkStartBossAttack = function(){
    var countPlayer = this.player.length;
    for( var i  = 0; i < countPlayer ; i++ ){
        if( this.player[i].getCurrentHP() > 0 && !this.player[i].getIsLock() && this.player[i].getAttackAble()){
            return false;
        }
    }
    return true;
}

pro.getPlayerInfo = function(){
    return this.player;
}

pro.getFriendInfo = function(noPlayer){


    for(var i = 0; i < this.player.length ; i++){
        if( i != (noPlayer - 1)){
             return this.player[i];
        }

    }
    return null;
    //return this.player[noPlayer -1];
}

pro.reduceBossHP = function( noPlayer,bossName, reduceHP){

    var returnVL = {};

    if(!this.isStart) {
        returnVL.isStart = false;
        returnVL.targetName = "";
        returnVL.boss = [];
        return returnVL;
    }
    var bossInfo = [];
    var j = 0;
    for( var i = 0; i < this.boss.length; i++){
        if( bossName == this.boss[i].getName() ){
            this.boss[i].reduceHP(reduceHP);
        }
        if( this.boss[i].getCurrentHP() <= 0){
             bossInfo[j] = this.boss[i].getName();
             j++;
        }
    }
    var targetPlayer = [];
    for(var i = 0; i < this.player.length ; i++){
        var oldTarget = this.player[i].getTarget();
        var newTarget = this.checkPlayerOfTarget(oldTarget);
        if(newTarget != null && newTarget != ""){
            this.player[i].updateTarget(newTarget);
            targetPlayer[i] = newTarget;
        }
        else if(newTarget == ""){
            this.isStart = false;
            returnVL.isStart = true;
            returnVL.targetName = "";
            returnVL.boss = bossInfo;
            return returnVL;
        }
        else if(newTarget == null){
            targetPlayer[i] = oldTarget;
        }

    }
    returnVL.isStart =  false;
    returnVL.targetName = targetPlayer;
    returnVL.boss = bossInfo;
    return returnVL;

}


pro.checkPlayerOfTarget = function(targetName){
    for( var i = 0; i < this.boss.length; i++){
        if( targetName == this.boss[i].getName() ){
            if( this.boss[i].getCurrentHP() <= 0)
                return this.getBossNameTarget();
        }
    }
    return null;
}


/*pro.useItem = function(itemType,targetName,noPlayer){
    console.log(itemType+"|"+targetName+"|"+noPlayer);
    var usePlayer = this.getPlayerByID(targetName);
    if( usePlayer != null ){
        this.player[noPlayer - 1].reduceItem(itemType);
        usePlayer.useItem(itemType);
    }
}  */

pro.getPlayerByID = function(playerTarget){

    for(var i = 0; i< this.player.length ; i++){
        if( this.player[i].getID() == playerTarget){
            return this.player[i];
        }
    }
    return null;

}

pro.lockPlayer = function(noPlayer,isLock){
    if(typeof this.player[noPlayer - 1 ] != undefined){
        this.player[noPlayer - 1].setIsLock(isLock);
    }

    return this.checkAllPlayerLock();
}

pro.checkAllPlayerLock = function(){
    for( var i = 0; i< this.player.length; i++){
        if(!this.player[i].getIsLock()) return false;
    }
    return true;
}

pro.checkIsFinishGame = function(){
    for( var i = 0; i< this.player.length; i++){
        if(!this.player[i].getStatusDie()) return false;
    }
    return true;
}

pro.poisonPlayer = function(noPlayer,isLock){
    if(typeof this.player[noPlayer -1 ] != undefined)
        this.player[noPlayer - 1].setIsPoison(isLock);

}

pro.updateStatusRoom = function(isStart){
    this.isStart = isStart;
}

pro.checkEndStage = function(){
    for( var i = 0; i < this.boss.length ; i++){
        if(this.boss[i].getCurrentHP() > 0)
          return false;

    }
    return true;

}

pro.checkUpdateStatePlayer = function(){
    for( var i = 0; i < this.player.length ; i++){
        if(this.player[i].getCurrentHP() > 0){
            if( !this.player[i].getUpdateStage()) return false;
        }

    }

    return true;
}

pro.updateStatePlayer = function(isUpdate){
    for( var i = 0; i < this.player.length ; i++){
       this.player[i].updateStatePlayer(isUpdate);
    }
}

pro.updateStatePlayerByNoPlayer = function(isUpdate,noPlayer){

    if( typeof this.player[noPlayer -1 ] != undefined){
        this.player[noPlayer -1 ].setUpdateStage(isUpdate);
    }

}

pro.setStage = function(newStage){
    this.stage = newStage;
}

pro.getStage = function(){
    return this.stage;
}

pro.nextStage = function(){
    this.stage += 1;
}

pro.useItem = function(type,noPlayer,id){
    if(typeof this.player[noPlayer -1 ] != undefined)
        this.player[noPlayer-1].useItem(type);
    this.player[id].addItemEffect(type);

}

pro.getMyInfo = function(noPlayer){
   if(typeof this.player[noPlayer -1 ] != undefined)
        return this.player[noPlayer -1 ];
    return [];
}


pro.updatePlayerInfoByNoPlayer = function(current_hp, kougeki,current_gauge,noPlayer){
   if(typeof this.player[noPlayer -1 ] != undefined)
    this.player[noPlayer - 1].updateInfoFromClient(current_hp,current_gauge,kougeki);

}


pro.updateDieStatus = function(noPlayer){
    console.log("updateDieStatus");
    if(typeof this.player[noPlayer -1 ] != undefined)
        this.player[noPlayer - 1].updateDieStatus(true);
}


pro.updateCountDownTimeRevive = function( noPlayer) {
    if(typeof this.player[noPlayer -1 ] != undefined)
        this.player[noPlayer - 1].updateCurrentHP(0);
}


pro.updatePlayerOfTarget = function( noPlayer) {
    if(typeof this.player[noPlayer -1 ] != undefined){
        this.player[noPlayer - 1].updateTarget(this.getBossNameTarget());
        return this.player[noPlayer - 1].getTarget();
    }
    return "";

}


