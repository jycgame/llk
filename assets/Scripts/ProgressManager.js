var ProgressBarCom = require("ProgressBarCom");
var GameState = require("GameState");
var GameManager = require("GameManager");

cc.Class({
    extends: cc.Component,

    properties: () => ({
        totalTime: 0,
        leftTime: 0,
        progressBarCom: ProgressBarCom,
        timerLabel: cc.Label,
        jinRinAnim: cc.Animation,
    }),

    initial: function (totalTime)
    {
        this.leftTime = this.totalTime = totalTime;
        this.jinRinAnim.play();
        this.progressBarCom.initial();
    },

    update: function(dt)
    {
        this.leftTime -= dt;
        
        if (this.leftTime <= 0)
        {
            var gameManager = require("GameManager").instance;
            gameManager.changeToPanel(GameState.LOSE);
        }
        else
        {
            var factor = this.leftTime / this.totalTime;
            this.progressBarCom.setProgress(factor);
            this.timerLabel.string = Math.ceil(this.leftTime);
        }
    },

    subTime: function (time)
    {
        this.leftTime -= time;
    },
});
