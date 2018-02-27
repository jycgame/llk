cc.Class({
    extends: cc.Component,

    drawLines: function (points) {
        var actualPoints = new Array();
        for (var i = 0; i < points.length; i++) {
            if (actualPoints.find(function (element) {
                return element.x == points[i].x && element.y == points[i].y
                }))
            {
                continue;
            }
            else
            {
                actualPoints.push(points[i]);
            }
        }

        var graphic = this.getComponent(cc.Graphics);
        graphic.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < actualPoints.length; i++) {
            graphic.lineTo(actualPoints[i].x, actualPoints[i].y);
        }
        graphic.stroke();
    },

    clearLines: function () {
        var graphic = this.getComponent(cc.Graphics);
        graphic.clear();
    },
});
