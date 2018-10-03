cc.Class({
    extends: cc.Component,

    properties: {
        lost: {
            default: false,
        }
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        // TODO
        if (otherCollider.node.name == 'wallBottom') {
            this.lost = true;
            this.node.destroy();
            console.log('lost');
        }
    },
});