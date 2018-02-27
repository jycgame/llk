var Gamemanager = require("GameManager");
var GameState = require("GameState");

cc.Class({
    extends: cc.Component,

    confirm: function () {
        Gamemanager.instance.changeToPanel(GameState.START);
    },
});
