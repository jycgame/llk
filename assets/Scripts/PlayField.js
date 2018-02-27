var ItemData = require("ItemData");
var ProgressManager = require("ProgressManager");
var GameState = require("GameState");
var SuccessPanelCom = require("SuccessPanelCom");
var FailPanelCom = require("FailPanelCom");

var PlayField = cc.Class({
    extends: cc.Component,

    properties: () => ({
        isEditMode: false,

        itemDatas:
        {
            default: [],
            type: ItemData,
        },
        itemData:
        {
            default: null,
            type: ItemData,
        },
        itemPrefab: cc.Prefab,
        spriteFrames: [cc.SpriteFrame],
        path: [cc.Vec2],
        graphicDrawer: require("GraphicDrawer"),
        panelNodes: [cc.Node],
        progressManager: ProgressManager,
        successPanelCom: SuccessPanelCom,
        failPanelCom: FailPanelCom,
        scoreLabel: cc.Label,

        rowNum: 0,
        colNum: 0,
        totalTimeForTest: 0,
        timeSub: 0,
        scoreAdd: 0,
        scorePerSec: 0,
        targetScore: 0,

        currentSelected: null,
        secondSelected: null,
        currentScore: 0,
        itemNodeForTest: cc.Node,
        elapsedTime: 0,
    }),

    items: null,
    isRemoving: false,

    statics: {
        instance: null,
    },

    onLoad: function () {
        PlayField.instance = this;

        if (this.isEditMode) {
            this.itemNodeForTest = this.node.children[0];
            return;
        }
    },

    getRandomItemData: function () {
        var index = Math.floor(Math.random() * this.itemDatas.length);
        this.itemData = this.itemDatas[index];
    },

    clearItems: function () {
        for (var i = 0; i < this.node.childrenCount; i++) {
            this.node.children[i].destroy();
        }
    },

    clearLines: function () {
        this.graphicDrawer.clearLines();
    },

    spawnItems: function () {
        this.clearItems();
        this.clearLines();
        this.currentSelected = null;
        this.getRandomItemData();
        this.progressManager.initial(this.totalTimeForTest);
        this.rowNum = this.itemData.rowNum;
        this.colNum = this.itemData.colNum;
        var rowNum = this.rowNum;
        var colNum = this.colNum;
        var itemLength = this.itemData.itemLength;

        var space = this.getComponent(cc.Layout).spacingX;
        this.node.width = (itemLength + space) * colNum - space;
        this.items = new Array();

        for (var i = 0; i < rowNum; i++) {
            this.items[i] = new Array();
            for (var j = 0; j < colNum; j++) {
                var item = cc.instantiate(this.itemPrefab);
                item.width = itemLength;
                item.height = itemLength;
                item.parent = this.node;

                var self = this;
                var name = self.itemData.spriteNames[i * colNum + j];
                var sprite = this.spriteFrames.find(function (element) {
                    return element.name == name;
                });

                this.items[i][j] = item.getComponent("Item");
                if (sprite) {
                    this.items[i][j].setSpriteFrame(sprite);
                    this.items[i][j].rowIndex = i;
                    this.items[i][j].colIndex = j;
                    this.items[i][j].playField = this;
                }
            }
        }
        this.currentScore = 0;
        this.elapsedTime = 0;
        this.scoreLabel.string = this.currentScore;
    },

    canPassByCol: function (row1, row2, col, selfSprites) {
        var canPass = true;
        var minRow = Math.min(row1, row2);
        var maxRow = Math.max(row1, row2);

        for (var i = minRow; i <= maxRow; i++) {
            if (this.items[i][col].sprite.spriteFrame) {
                var self = this;
                if (selfSprites && selfSprites.find(function (element) {
                    return element == self.items[i][col].sprite;
                })) {
                    continue;
                }
                canPass = false;
                break;
            }
        }
        return canPass;
    },

    canPassByRow: function (col1, col2, row, selfSprites) {
        var canPass = true;
        var minCol = Math.min(col1, col2);
        var maxCol = Math.max(col1, col2);

        for (var i = minCol; i <= maxCol; i++) {
            if (this.items[row][i].sprite.spriteFrame) {
                var self = this;
                if (selfSprites && selfSprites.find(function (element) {
                    return element == self.items[row][i].sprite;
                })) {
                    continue;
                }
                canPass = false;
                break;
            }
        }

        return canPass;
    },

    getSearchColArray: function (startColIndex, targetColIndex) {
        var colArray = new Array();
        var minIndex = Math.min(startColIndex, targetColIndex);
        var maxIndex = Math.max(startColIndex, targetColIndex);

        for (var i = minIndex; i <= maxIndex; i++) {
            colArray.push(i);
        }

        while (minIndex >= 0 || maxIndex < this.colNum) {
            if (--minIndex >= 0) {
                colArray.push(minIndex);
            }

            if (++maxIndex < this.colNum) {
                colArray.push(maxIndex);
            }
        }
        return colArray;
    },

    getSearchRowArray: function (startRowIndex, targetRowIndex) {
        var rowArray = new Array();
        var minIndex = Math.min(startRowIndex, targetRowIndex);
        var maxIndex = Math.max(startRowIndex, targetRowIndex);

        for (var i = minIndex; i <= maxIndex; i++) {
            rowArray.push(i);
        }


        while (minIndex >= 0 || maxIndex < this.rowNum) {
            if (--minIndex >= 0) {
                rowArray.push(minIndex);
            }

            if (++maxIndex < this.colNum) {
                rowArray.push(maxIndex);
            }
        }
        return rowArray;
    },

    getPoints: function (startRowIndex, startColIndex, targetRowIndex, targetColIndex, startSprite, targetSprite) {
        var points = null;
        var allSprites = new Array();
        allSprites.push(startSprite);
        allSprites.push(targetSprite);

        var colArray = this.getSearchColArray(startColIndex, targetColIndex);
        var rowArray = this.getSearchRowArray(startRowIndex, targetRowIndex);

        for (var index = 0; index < colArray.length; index++) {

            var i = colArray[index];

            if (this.canPassByRow(i, startColIndex, startRowIndex, allSprites) && this.canPassByRow(i, targetColIndex, targetRowIndex, allSprites)) {
                var col = i;
                if (this.canPassByCol(startRowIndex, targetRowIndex, col, allSprites)) {
                    points = new Array();
                    points.push(this.items[startRowIndex][startColIndex].node.position);
                    points.push(this.items[startRowIndex][col].node.position);
                    points.push(this.items[targetRowIndex][col].node.position);
                    points.push(this.items[targetRowIndex][targetColIndex].node.position);
                    return points;
                }
            }
        }

        for (var index = 0; index < rowArray.length; index++) {

            var j = rowArray[index];

            if (this.canPassByCol(j, startRowIndex, startColIndex, allSprites) && this.canPassByCol(j, targetRowIndex, targetColIndex, allSprites)) {
                var row = j;
                if (this.canPassByRow(startColIndex, targetColIndex, row, allSprites)) {
                    points = new Array();
                    points.push(this.items[startRowIndex][startColIndex].node.position);
                    points.push(this.items[row][startColIndex].node.position);
                    points.push(this.items[row][targetColIndex].node.position);
                    points.push(this.items[targetRowIndex][targetColIndex].node.position);
                    return points;
                }
            }
        }

        return points;
    },

    subTime: function () {
        this.progressManager.subTime(this.timeSub);
    },

    addScore: function () {
        this.currentScore += this.scoreAdd;
        this.scoreLabel.string = this.currentScore;
    },

    drawLines: function (points) {
        this.graphicDrawer.drawLines(points);
    },

    outputInfo: function () {
        var str = this.totalTimeForTest + "," + this.timeSub + "," + this.scoreAdd + "," + this.scorePerSec + "," + this.targetScore + "," + this.rowNum + "," + this.colNum + "," + this.itemNodeForTest.width + ",";

        for (var i = 0; i < this.node.childrenCount; i++) {
            var item = this.node.children[i].getComponent("Item")
            if (item.sprite.spriteFrame) {
                str += item.sprite.spriteFrame.name + "|";
            }
            else {
                str += "none|";
            }
        }

        str = str.substr(0, str.length - 1);

        console.log(str);
    },

    isAllClear: function () {
        var isClear = true;

        for (var i = 0; i < this.node.childrenCount; i++) {
            if (this.node.children[i].getComponent("Item").sprite.spriteFrame) {
                isClear = false;
                break;
            }
        }

        return isClear;
    },

    getTimeScore: function () {
        return Math.ceil(this.progressManager.leftTime * this.scorePerSec);
    },

    update: function (dt) {
        this.elapsedTime += dt;
    },
});

module.exports = PlayField;
