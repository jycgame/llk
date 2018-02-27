cc.Class({
    extends: cc.Component,

    properties: {
        maskNode: cc.Node,
    },

    update: function (dt) {
        this.node.x = this.maskNode.width - 20;
    },
});
