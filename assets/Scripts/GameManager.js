var PlayField = require("PlayField");
var GameState = require("GameState");
var ItemData = require("ItemData");
var MusicManager = require("MusicManager");
var RankList = require("RankList");
var RankItem = require("RankItem");

var GameManager = cc.Class({
    extends: cc.Component,

    properties: {
        playField: PlayField,
        isReady: false,
        UserDataURL : "https://jcyapi.easybao.com/jcy-api/app/system/getUserMessage",
        dbURL: "https://games.jcgroup.com.cn/ysdlm/db",
        queryExistURL: "https://games.jcgroup.com.cn/ysdlm/db/queryuserexist.php",
        registerURL: "https://games.jcgroup.com.cn/ysdlm/db/register.php",
        queryIndexURL: "https://games.jcgroup.com.cn/ysdlm/db/queryindex.php",
        uploadscoreURL: "https://games.jcgroup.com.cn/ysdlm/db/uploadscore.php",
        querySortURL: "https://games.jcgroup.com.cn/ysdlm/db/querysort.php",
        updateLastRankURL: "https://games.jcgroup.com.cn/ysdlm/db/updateLastRank.php",
        startGameButton: cc.Button,
    },

    accessToken: null,
    gameId: null,
    saveUrl: null,
    listUrl: null,

    isUserLogginedIn: false,
    //http相关参数
    userId: null,
    userName: null,
    userNickName: null,
    highScore: null,

    statics: {
        instance: null,
    },

    onLoad: function () {
        GameManager.instance = this;
        this.disableButton();
        this.accessToken = this.getURLParameter("token");
        this.gameId = "3";
        this.saveUrl = "https://jcyapi.easybao.com/jcy-api/jcygame/user/game/saveGameProcess";
        this.listUrl = "https://jcyapi.easybao.com/jcy-api/jcygame/user/game/getGameList";
        this.readData();
        this.getUserData();
    },
    
    enableButton: function(){
        this.startGameButton.interactable = true;
        this.startGameButton.node.color = new cc.Color(255, 255, 255);
    },
    
    disableButton: function(){
        this.startGameButton.interactable = false;
        this.startGameButton.node.color = new cc.Color(128, 128, 128);
    },

    getURLParameter: function (name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    },

    getUserData: function () {
        this.userId = this.getURLParameter("userNo");
        var self = this;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", this.UserDataURL);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        var paramJson = { "userNo": this.userId };
        xmlhttp.send(JSON.stringify(paramJson));
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    var obj = JSON.parse(xmlhttp.responseText);
                    if (obj.data) {
                        self.isUserLogginedIn = true;
                        self.userName = obj.data.name;
                        self.userNickName = obj.data.nickName;
                        self.checkUserId();
                    }
                    else //未登录 
                    {
                        console.log("未登录");
                        self.enableButton();
                    }
                }
                else {
                    cc.log("getUserData error!");
                }
            }
        }
    }, 

    checkUserId: function () {
        var self = this;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", self.queryExistURL + "?uuid=" + self.userId);
        xmlhttp.send(null);
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    if (xmlhttp.responseText == "No") {
                        var nextXmlHttp = new XMLHttpRequest();
                        nextXmlHttp.open("GET", self.registerURL + "?uuid=" + self.userId + "&highscore=0" + "&name=" + self.userName + "&nickName=" + self.userNickName);
                        nextXmlHttp.send(null);
                        nextXmlHttp.onreadystatechange = function () {
                            if (xmlhttp.readyState == 4) {
                                if (xmlhttp.status == 200) {
                                    console.log("registerd");
                                    self.enableButton();
                                }
                            }
                        }
                    }
                    else if((xmlhttp.responseText == "Yes")){
                        self.enableButton();
                    }
                }
            }
        }
    },

    saveData: function () {
        //var myDate = new Date();

        //var paramJson = {
        //    "accessToken": this.accessToken,
        //    "gameId": this.gameId,
        //    "time": myDate.getFullYear() + "-" + myDate.getMonth() + "-" + myDate.getDate() + " " + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds(),
        //    "process": "1",
        //};

        //var xmlhttp = new XMLHttpRequest();
        //xmlhttp.open("POST", this.saveUrl);
        //xmlhttp.setRequestHeader("Content-Type", "application/json");
        //xmlhttp.send(JSON.stringify(paramJson));

        //xmlhttp.onreadystatechange = function () {
        //    if (xmlhttp.readyState == 4) {
        //        if (xmlhttp.status == 200) {
        //            var obj = JSON.parse(xmlhttp.responseText);
        //            if (obj.data == null) {
        //                console.error("Can't find user name by user id!");
        //                return;
        //            }
        //        }
        //        else {
        //            cc.log("saveData error!");
        //        }
        //    }
        //}

        if (this.isUserLogginedIn) {
            var self = this;
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", self.uploadscoreURL + "?uuid=" + self.userId + "&highscore=" + self.playField.currentScore);
            xmlhttp.send(null);
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        console.log("uploadscore");
                    }
                }
            };
        }

    },

    loadData: function () {
        //var paramJson = {
        //    "accessToken": this.accessToken,
        //};

        //var xmlhttp = new XMLHttpRequest();
        //xmlhttp.open("POST", this.listUrl);
        //xmlhttp.setRequestHeader("Content-Type", "application/json");
        //xmlhttp.send(JSON.stringify(paramJson));

        //xmlhttp.onreadystatechange = function () {
        //    if (xmlhttp.readyState == 4) {
        //        if (xmlhttp.status == 200) {
        //            var obj = JSON.parse(xmlhttp.responseText);
        //            if (obj.data == null) {
        //                console.error("Can't find user name by user id!");
        //                return;
        //            }
        //        }
        //        else {
        //            cc.log("loadData error!");
        //        }
        //    }
        //}
    },

    readData: function () {
        var self = this;
        cc.loader.loadRes("Data/LevelData", function (err, data) {
            if (err) {
                cc.error(err.message || err);
                return;
            } else {
                var lines = data.trim().split("\n");
                self.playField.itemDatas = new Array();

                for (var i = 0; i < lines.length - 1; i++) {
                    self.playField.itemDatas[i] = new ItemData();
                    var contents = lines[i + 1].split(',');
                    self.playField.totalTimeForTest = parseInt(contents[0]);
                    self.playField.timeSub = parseInt(contents[1]);
                    self.playField.scoreAdd = parseInt(contents[2]);
                    self.playField.scorePerSec = parseInt(contents[3]);
                    self.playField.targetScore = parseInt(contents[4]);
                    self.playField.itemDatas[i].rowNum = parseInt(contents[5]);
                    self.playField.itemDatas[i].colNum = parseInt(contents[6]);
                    self.playField.itemDatas[i].itemLength = parseInt(contents[7]);
                    self.playField.itemDatas[i].spriteNames = contents[8].trim().split("|");
                    self.isReady = true;
                }
            }
        });
    },

    startGame: function () {
        if (!cc.sys.localStorage.getItem("isFreshOfConnect")) {
            this.changeToPanel(GameState.GUIDE);
            cc.sys.localStorage.setItem("isFreshOfConnect", "true");
            return;
        }

        if (this.playField.panelNodes[GameState.RANK].active && this.isUserLogginedIn) {
            var self = this;
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", self.updateLastRankURL + "?uuid=" + self.userId);
            xmlhttp.send(null);
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        console.log("refresh rank");
                    }
                }
            }
        }

        this.changeToPanel(GameState.GAME);
        MusicManager.instance.playBackgroundAudio(0);
        this.playField.spawnItems();
    },

    changeToPanel: function (stateValue) {
        if (!this.isReady) {
            return;
        }

        for (var i = 0; i < this.playField.panelNodes.length; i++) {
            if (i == stateValue) {
                this.playField.panelNodes[i].active = true;
                switch (i) {
                    case GameState.WIN:
                        this.playField.currentScore += this.playField.getTimeScore();
                        this.playField.successPanelCom.showInfo(this.playField.currentScore, this.playField.totalTimeForTest - this.playField.progressManager.leftTime);
                        this.saveData();
                        MusicManager.instance.playBackgroundAudioOnce(1);
                        break;
                    case GameState.LOSE:
                        this.playField.failPanelCom.showInfo(this.playField.currentScore, this.playField.totalTimeForTest);
                        this.saveData();
                        MusicManager.instance.playBackgroundAudioOnce(2);
                        break;
                }
            }
            else {
                this.playField.panelNodes[i].active = false;
            }
        }
    },

    returnToMain: function () {
        cc.director.loadScene("Main");
    },

    playAgain: function () {
        this.startGame();
    },

    showRank: function () {
        this.changeToPanel(GameState.RANK);
        var rankList = cc.find("rankList", this.playField.panelNodes[GameState.RANK]).getComponent(RankList);
        var rankItems = rankList.rankItems;
        var self = this;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", self.querySortURL + "?count=5");
        xmlhttp.send(null);
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    var rows = xmlhttp.responseText.split("\n\r");
                    for (var i = 0; i < rows.length; i++) {
                        var items = rows[i].split(",");
                        if (items[0] == "")
                        {
                            rows.pop();
                            break;
                        }
                        var backSpriteFrame = rankList.bannerSpriteFrames[0];
                        var rankNum = i + 1;
                        var rankNumColor = new cc.Color(184, 69, 0);
                        var lastRank = items[3];
                        var differ = 0;
                        if (lastRank != "0") {
                            differ = parseInt(lastRank) - rankNum;
                        }
                        var differColor = null;
                        if (differ > 0) {
                            differColor = new cc.Color(3, 133, 0); 
                        }
                        else if (differ < 0) {
                            differColor = new cc.Color(174, 0, 0);
                        }
                        var userName = items[4];
                        var userColor = new cc.Color(0, 93, 184);
                        var score = items[1];
                        var scoreColor = new cc.Color(0, 93, 184);

                        rankItems[i].showInfo(backSpriteFrame, rankNum, rankNumColor, differ, differColor, userName, userColor, score, scoreColor);
                    }
                    if (rows.length<5) {
                        for (var i = rows.length; i < 5; i++) {
                            var backSpriteFrame = rankList.bannerSpriteFrames[0];
                            var rankNum = i + 1;
                            var rankNumColor = new cc.Color(184, 69, 0);
                            var differ = 0;
                            var userName = "虚位以待";
                            var userColor = new cc.Color(0, 93, 184);
                            var score = 0;
                            var scoreColor = new cc.Color(0, 93, 184);

                            rankItems[i].showInfo(backSpriteFrame, rankNum, rankNumColor, differ, differColor, userName, userColor, score, scoreColor);
                        }
                    }
                }

                var queryIndexHttp = new XMLHttpRequest
                queryIndexHttp.open("GET", self.queryIndexURL + "?uuid=" + self.userId);
                queryIndexHttp.send(null);
                queryIndexHttp.onreadystatechange = function () {
                    if (queryIndexHttp.readyState == 4) {
                        if (queryIndexHttp.status == 200) {
                            var items = queryIndexHttp.responseText.split(",");
                            var backSpriteFrame = rankList.bannerSpriteFrames[1];
                            var baseColor = cc.Color.WHITE;
                            var rankNum = items[0];
                            var lastRank = items[2];
                            var differ = 0;
                            if (lastRank != "0") {
                                differ = parseInt(lastRank) - rankNum;
                            }
                            var userName = self.userName;
                            var score = items[1];
                            rankItems[5].showInfo(backSpriteFrame, rankNum, baseColor, differ, baseColor, userName, baseColor, score, baseColor);
                        }
                    }
                }
            }
        }
    }
});
