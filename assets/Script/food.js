cc.Class({
    extends: cc.Component,

    properties: {
        score: {
            default: 1,
        }
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        // FIXME: lost
        if (otherCollider.node.name == 'wallBottom') {
            this.node.ctl.onLostFood(this);
            console.log('lost');
        }
        if (otherCollider.node.name == 'ball') {
            this.node.ctl.onEatFood(this);
            console.log('eat');
        }
    },
});
