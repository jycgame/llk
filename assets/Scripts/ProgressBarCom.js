cc.Class({
    extends: cc.Component,

    properties: {
        barBgNode: cc.Node,
        barMaskNode: cc.Node,
        barNode: cc.Node,
        barSpriteFrames: [cc.SpriteFrame],


    },

    initialWidth: 0,
    initialHeight: 0,

    onLoad: function(){
        this.initialWidth = this.barNode.width;
        this.initialHeight = this.barNode.height;
    },

    initial: function ()
    {
        this.barMaskNode.width = this.barNode.width = this.initialWidth;
        this.barMaskNode.height = this.barNode.height = this.initialHeight;
        this.barNode.getComponent(cc.Sprite).spriteFrame = this.barSpriteFrames[0];
    },

    setProgress: function (factor) {
        if (factor <= 0.2) {
            this.barNode.getComponent(cc.Sprite).spriteFrame = this.barSpriteFrames[1];
        }
        this.barMaskNode.width = this.barBgNode.width * factor;
    },
});
