cc.Class({
    extends: cc.Component,

    properties: {
        speed: 400,
        direction_x: 0,
        direction_y: 0,
        user: null,
        touchLoc: null,
        touch_active: false,
    },

    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if (this.touch_active) {
                this.touchLoc = event.getTouches()[0].getLocation();
            } 
            // else {
            //     event.stopPropagation();
            // }
        }, this);
    },

    update: function (dt) {
        if (this.touchLoc) {
            this.node.position = this.node.parent.convertToNodeSpaceAR(this.touchLoc);
        }
    },
});