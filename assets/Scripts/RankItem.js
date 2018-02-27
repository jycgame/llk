cc.Class({
    extends: cc.Component,

    properties: {
        rankSpriteFrames: [cc.SpriteFrame],
        differIconSpriteFrames: [cc.SpriteFrame],
    },

    showInfo: function (backSpriteFrame, rank, rankColor,differ, differColor, userName, userNameColor, score, scoreColor)
    {
        this.node.children[0].getComponent(cc.Sprite).spriteFrame = backSpriteFrame;

        var imgNode = cc.find("itembody/rankNum/center/img_no1", this.node);
        var rankNumNode = cc.find("itembody/rankNum/center/rankNum", this.node);
        if (rank > 0 && rank <= 3) {
            imgNode.active = true;
            rankNumNode.active = false;
            var sprite = cc.find("itembody/rankNum/center/img_no1", this.node).getComponent(cc.Sprite);
            sprite.spriteFrame = this.rankSpriteFrames[rank - 1];
        }
        else {
            imgNode.active = false;
            rankNumNode.active = true;
            rankNumNode.color = rankColor;
            rankNumNode.getComponent(cc.Label).string = rank;
        }

        var iconNode = cc.find("itembody/differ/icon", this.node);
        var differStrNode = cc.find("itembody/differ/differStr", this.node);
        if (differ > 0)
        {
            iconNode.active = true;
            differStrNode.active = true;
            differStrNode.color = differColor
            iconNode.getComponent(cc.Sprite).spriteFrame = this.differIconSpriteFrames[0];
            if (differ < 1000) {
                differStrNode.getComponent(cc.Label).string = differ;
            }
            else {
                differStrNode.getComponent(cc.Label).string = "999+";
            }
        }
        else if (differ < 0) {
            iconNode.active = true;
            differStrNode.active = true;
            differStrNode.color = differColor;
            iconNode.getComponent(cc.Sprite).spriteFrame = this.differIconSpriteFrames[1];
            if (differ < 1000) {
                differStrNode.getComponent(cc.Label).string = differ;
            }
            else {
                differStrNode.getComponent(cc.Label).string = "999+";
            }
        }
        else {
            iconNode.active = false;
            differStrNode.active = false;
        }

        var nameNode = cc.find("itembody/playerName/nameLabel", this.node);
        nameNode.color = userNameColor;
        nameNode.getComponent(cc.Label).string = userName;

        var scoreNode = cc.find("itembody/score/scoreLabel", this.node);
        scoreNode.color = scoreColor;
        scoreNode.getComponent(cc.Label).string = score;
    },
});
