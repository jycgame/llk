var PlayField = require("PlayField");
var GameState = require("GameState");
var GameManager = require("GameManager");
var MusicManager = require("MusicManager");

cc.Class({
    extends: cc.Component,

    properties: {
        itemNode: cc.Node,
        selectNode: cc.Node,
        rowIndex: -1,
        colIndex: -1,
    },
    sprite: null,
    selectAnim: null,

    onLoad: function () {
        this.sprite = this.itemNode.getComponent(cc.Sprite);
        this.selectAnim = this.selectNode.getComponent(cc.Animation);
    },

    onEnable: function () {
        this.node.on("touchstart", this.onTouchStart, this);
    },

    onDisable: function () {
        this.node.off("touchstart", this.onTouchStart, this);
    },

    showSelect: function () {
        this.selectNode.active = true;
        this.selectAnim.play();
    },

    hideSelect: function () {
        this.selectNode.active = false;
    },

    compareTo: function (other) {
        return (this.sprite.spriteFrame.name == other.sprite.spriteFrame.name);
    },

    setSpriteFrame: function (frame) {
        this.sprite.spriteFrame = frame;
    },

    hideItem: function () {
        this.sprite.spriteFrame = null;
    },

    onTouchStart: function () {
        if (PlayField.instance.isRemoving) {
            return;
        }

        if (!PlayField.instance.currentSelected) {
            if (this.sprite.spriteFrame)
            {
                PlayField.instance.currentSelected = this;
                this.showSelect();
            }
        }
        else if (!this.sprite.spriteFrame || PlayField.instance.currentSelected == this) {
            PlayField.instance.currentSelected.hideSelect();
            PlayField.instance.currentSelected = null;
        }
        else {
            if (this.compareTo(PlayField.instance.currentSelected)) {
                var points = PlayField.instance.getPoints(PlayField.instance.currentSelected.rowIndex, PlayField.instance.currentSelected.colIndex,
                    this.rowIndex, this.colIndex, PlayField.instance.currentSelected.sprite, this.sprite);
                if (points) {
                    this.playField.drawLines(points);
                    PlayField.instance.secondSelected = this;
                    this.showSelect();
                    PlayField.instance.isRemoving = true;
                    setTimeout(this.selectRight.bind(this), 400);
                }
                else {
                    this.selectWrong();
                }
            }
            else {
                this.selectWrong();
            }
        }
    },

    cancelSelect: function () {
        PlayField.instance.currentSelected.hideSelect();
        PlayField.instance.currentSelected = null;
        if (PlayField.instance.secondSelected) {
            PlayField.instance.secondSelected.hideSelect();
            PlayField.instance.secondSelected = null;
        }
    },

    selectWrong: function () {
        PlayField.instance.subTime();
        MusicManager.instance.playSfxAudio(1);
        this.cancelSelect();
    },

    selectRight: function () {
        this.hideItem();
        PlayField.instance.clearLines();
        PlayField.instance.addScore();
        PlayField.instance.currentSelected.hideItem();
        this.cancelSelect();
        MusicManager.instance.playSfxAudio(0);

        if (PlayField.instance.isAllClear()) {
            GameManager.instance.changeToPanel(GameState.WIN);
        }
        PlayField.instance.isRemoving = false;
    },
});
