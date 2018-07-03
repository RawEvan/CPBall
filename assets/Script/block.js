cc.Class({
    extends: cc.Component,

    properties: {
        speed: 400,
        user: null,
        touchLoc: null,
        touchActive: false,
        isMoving: false
    },

    onLoad: function () {

    },

    update: function (dt) {
        if (!this.isMoving) return;
        var oldPos = this.node.position;
        // get move direction
        if (this.touchLoc && oldPos && this.touchLoc != oldPos) {
            var direction = cc.pNormalize(cc.pSub(this.touchLoc, oldPos));
            // multiply direction with distance to get new position
            var rate = Math.abs((this.touchLoc.x - oldPos.x)/this.touchLoc.x);
            if (rate > 1) rate = 1;
            var newPos = cc.pAdd(oldPos, cc.pMult(direction, this.speed * dt * rate));
            // set new position
            this.node.setPosition(newPos);
        };
    }
});