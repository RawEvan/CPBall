cc.Class({
    extends: cc.Component,

    onBeginContact: function (contact, selfCollider, otherCollider) {
        this.node.destroy();
    },
    
});
