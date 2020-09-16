const {SBWorld} = require('./SBWorld');
cc.Class({
    extends: cc.Component,
    
    properties: {
        symbols: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.world = new SBWorld();
    },

    start () {

    },

    // update (dt) {},
});
