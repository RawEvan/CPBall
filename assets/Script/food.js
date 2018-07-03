cc.Class({
    extends: cc.Component,

    properties: {
        score: 1,
        lost: false,
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        if (otherCollider.node.name == 'groud') {
            this.lost = true;
            this.node.ctl.onLostFood(this);
            console.log('lost');
        }
        if (otherCollider.node.name == 'ball') {
            this.node.ctl.onEatFood(this);
            console.log('eat');    
        }
        this.node.destroy();
    },
});
