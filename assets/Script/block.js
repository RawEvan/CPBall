cc.Class({
    extends: cc.Component,

    properties: {
        speed: {
            default: 8,
        },
        speedMax: {
            default: 1,
        },
        speedMin: {
            default: 0.2,
        },
        user: null,
        touchLoc: null,
        touchActive: false,
        isMoving: false
    },

    onLoad: function () {

    },

    checkSpeed: function (speed, parent) {
        if (speed / parent > this.speedMax) speed = this.speedMax;
        if (speed / parent < this.speedMin) speed = this.speedMin;
        return speed;
    },

    update: function (dt) {
        if (!this.isMoving) return;
        var oldPos = this.node.position;
        // get move direction
        if (this.touchLoc && oldPos && this.touchLoc != oldPos) {
            // console.log('TouchLoc: ', this.touchLoc, 'oldPos:', oldPos);
            // var direction = cc.pNormalize(cc.pSub(this.touchLoc, oldPos));
            var direction = cc.pSub(this.touchLoc, oldPos);
            // multiply direction with distance to get new position
            // speedx = this.touchLoc.x - oldPos.x;
            // speedy = this.touchLoc.y - oldPos.y;
            // speedx = this.checkSpeed(speedx, this.node.parent.width);
            // speedy = this.checkSpeed(speedy, this.node.parent.height);
            var newPos = cc.pAdd(oldPos, cc.pMult(direction, this.speed * dt));
            // set new position
            this.node.setPosition(newPos);
            // console.log('direction:', direction, 'newPos:', newPos);
        };
    }
});