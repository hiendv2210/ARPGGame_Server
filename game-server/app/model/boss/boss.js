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
    this.specialType = 0;
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

pro.getCurrentHP = function(){
    return this.current_hp;
}
pro.reduceHP = function(reduceHP){
    this.current_hp -= reduceHP;
    if( this.current_hp < 0 ) this.current_hp = 0;
}

pro.updateSpecailAttack = function(){
    if (this.attribute != 3)
    {
        var isSpecial = checkRate (30);
        //var isSpecial = checkRate (100);

        if (isSpecial)
        {
            this.specialType = this.attribute;
        }
        else
        {
            this.specialType =  0;
        }
    }
    else
    {
       // var isPoison = checkRate(0);
       // var isLock = checkRate(0);
        var isPoison = checkRate(0);
        var isLock = checkRate(0);

        if (isPoison && isLock)
        {
            this.specialType =  3;
        }
        else if (isLock)
        {
            this.specialType = 2;
        }
        else if (isPoison)
        {
            this.specialType = 1;
        }
        else
        {
            this.specialType = 0;
        }
    }



}

pro.reduceTurn = function(){
    this.turn -- ;
    if(this.turn <= 0){
        this.turn = 3;
        return true;
    }
    return false;


}

var checkRate = function(i){
    var rd = Math.floor(Math.random() * 100) + 1;
    if( rd < i) return true;
    else return false;

}




