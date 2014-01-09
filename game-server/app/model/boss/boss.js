/**
 * Created with JetBrains WebStorm.
 * User: dangvanhien
 * Date: 1/9/14
 * Time: 10:19 AM
 * To change this template use File | Settings | File Templates.
 */


var Mode = function(opts) {
    this.kougeki = opts.kougeki;
    this.hp = opts.hp;
    this.current_hp = opts.current_hp;
    this.turn = opts.turn;
    this.attribute = opts.attribute;
};

module.exports = Mode;

var pro = Mode.prototype;

pro.update = function() {
    if(this.path.length === 0) {
        //if path is empty
        return patrol.RES_FINISH;
    }

    if(!this.started) {
        this.character.move(this.path[0].x, this.path[0].y);
        this.started = true;
        return patrol.RES_WAIT;
    }

    var dest = this.path[0];
    if(this.character.x !== dest.x || this.character.y !== dest.y) {
        //if i am on the road to dest
        return patrol.RES_WAIT;
    }

    this.path.shift();

    if(this.path.length === 0) {
        return patrol.RES_FINISH;
    }

    //move to next destination
    this.character.move(this.path[0].x, this.path[0].y);
    return patrol.RES_WAIT;
};

