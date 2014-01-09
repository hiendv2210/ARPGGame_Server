/**
 * Created with JetBrains WebStorm.
 * User: dangvanhien
 * Date: 1/9/14
 * Time: 10:24 AM
 * To change this template use File | Settings | File Templates.
 */

var Player = require("../player/player");


var Room = function(opts) {
    console.log("create room");
    this.boss = {};
    this.player1 = new Player(1);
    this.player2 = new Player(2);
    this.stage = 0;
    this.type = opts.type;
};

var RoomDetail = {
    0:[
        {name: "angel_1",hp: "5000", kougeki :"1000",attribute:"0"},
        {name: "angel_2",hp: "5000", kougeki :"1000",attribute:"0"},
        {name: "angel_3",hp: "5000", kougeki :"1000",attribute:"0"}
      ]
}

module.exports = Room;

var pro = Room.prototype;

pro.updateStage = function(){
    this.boos = {};
    var detail = RoomDetail[this.stage];


}




