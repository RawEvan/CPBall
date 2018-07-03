cc.Class({
    extends: cc.Component,

    properties: {
        lost: false,
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        if (otherCollider.node.name == 'groud') {
            this.lost = true;
            this.node.ctl.onLostFood(this);
            console.log('lost');
        }
    },
});