var RankItem = require("RankItem")

cc.Class({
    extends: cc.Component,

    properties: {
        bannerSpriteFrames: [cc.SpriteFrame],
        rankItems: [RankItem]
    },
});
