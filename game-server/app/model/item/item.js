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

pro.reduceNumberItem = function(type){
    switch(type){
        case 1:
            this.hp2000 -= 1;
            if(this.hp2000 < 0) this.hp2000 = 0;
            break;
        case 2:
            this.hp5000 -= 1;
            if(this.hp5000 < 0) this.hp5000 = 0;
            break;
        case 3:
            this.revive -= 1;
            if(this.revive < 0) this.revive = 0;
            break;
        case 4:
            this.unlock -= 1;
            if(this.unlock < 0) this.unlock = 0;
            break;
        case 5:
            this.anatoxic -= 1;
            if(this.anatoxic < 0) this.anatoxic = 0;
            break;
    }

}