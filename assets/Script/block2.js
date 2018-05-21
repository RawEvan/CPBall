// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        speed: 200,
        direction_x: 0,
        direction_y: 0,
    },

    random_direction: function (direction) {
        return direction + (Math.random() - 0.5);
    },
    update: function (dt) {
        var new_direction_x = this.random_direction(this.direction_x);
        var new_direction_y = this.random_direction(this.direction_x);
        this.node.x += dt * this.speed * new_direction_x;
        this.node.y += dt * this.speed * new_direction_y;
    },
});
