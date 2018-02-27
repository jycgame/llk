cc.Class({
    extends: cc.Component,

    properties: {
        label: cc.Label,
        timeLabel: cc.Label,
        returnToMainNode: cc.Node,
        rankButtonNode: cc.Node,
    },

    showInfo: function (score, time) {
        var GameManager = require("GameManager");
        if (GameManager.instance.isUserLogginedIn) {
            this.returnToMainNode.active = false;
            this.rankButtonNode.active = true;
        }
        else {
            this.returnToMainNode.active = true;
            this.rankButtonNode.active = false;
        }
        this.label.string = score;
        this.timeLabel.string = Math.round(time);
    },
});