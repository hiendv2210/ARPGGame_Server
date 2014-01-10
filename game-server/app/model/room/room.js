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

};

var RoomDetail = {
    0:[
        {name: "angel_1",hp: 5000, kougeki :1000,attribute:0},
        {name: "angel_2",hp: 5000, kougeki :1000,attribute:0},
        {name: "angel_3",hp: 5000, kougeki :1000,attribute:0}
      ]
}

module.exports = Room;

var pro = Room.prototype;


pro.updateStage = function(){
    //this.boos = {};
    var detail = RoomDetail[this.stage - 1];

    for( var i  = 0 ; i < detail.length ; i ++ ){
          var opts = {};

          opts.name = detail[i].name;
          opts.kougeki = detail[i].kougeki;
          opts.hp = detail[i].hp;
          opts.current_hp =  detail[i].hp;
          opts.turn = Math.floor(Math.random() * 4) + 1;
          opts.attribute = detail[i].attribute;
          opts.target = "";
          var bs = new Boss(opts);
          this.boss[i] = bs;


    }

}



pro.getRoomOfBoosInfo = function(){

    return this.boss;


}

pro.getPlayerInfo = function( ){

    return this.player;


}

pro.createPlayer = function( noPlayer , typeWeapon,namePlayer ){
    var opts = {};
    opts.id = noPlayer;
    opts.name = namePlayer;
    if( typeWeapon == 2){

        opts.kougeki = 200;
        opts.hp = 9999;
        opts.current_hp = 9999;
        opts.gauge = 500;
        opts.currentGauge = 0;
        opts.level = 1;
        opts.attribute = 2;
    }
    else {
        opts.kougeki = 150;
        opts.hp = 9999;
        opts.current_hp = 9999;
        opts.gauge = 500;
        opts.currentGauge = 0;
        opts.level = 1;
        opts.attribute = 1;
    }

    var pl = new Player(opts);

    this.player[noPlayer ] = pl;

}

pro.removePlayer = function(noPlayer){
    //console.log(noPlayer);
    //this.player[noPlayer - 1 ] = "";
    this.player.splice(noPlayer - 1 ,1);

}

pro.getBossInfoBeforeStartAttack = function(){
    console.log("getBossInfoBeforeStartAttack");
    for( var i = 0; i < this.boss.length; i++){
       this.boss[i].updateTarget( this.getPlayerNameTarget());
    }
    return this.boss;
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
       if( this.player[i].current_hp > 0){
          listPlayerAvaiable[j] = this.player[i];
          j++;
       }
    }


    var rd = Math.floor(Math.random() * listPlayerAvaiable.length );

    return listPlayerAvaiable[rd].getName();
}


