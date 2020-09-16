const {SBWorld} = require('./SBWorld');
cc.Class({
    extends: cc.Component,
    
    properties: {
        symbols: {
            default: [],
            type: cc.SpriteFrame
        },
        table: {
            default:null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.symW = 120;
        this.symH = 120;
        this.reelDelay = 0.05;
        this.colors = [new cc.Color().fromHEX('#ff0000'), new cc.Color().fromHEX('#00ff00'), new cc.Color().fromHEX('#0000ff'),
        new cc.Color().fromHEX('#ffff00'), new cc.Color().fromHEX('#00ffff')];

        let cols = 5;
        let rows = 3;
        this.cols = cols;
        this.rows = rows;
        let masker = this.table.addComponent(cc.Mask);
        this.table.setContentSize(cc.size(this.symW*cols, this.symW*rows));

        this.world = new SBWorld(cols, rows, this.symW, this.symH, 0);
        for (let i = 0; i < this.symbols.length; i++) this.symbols['type'] = i;
        // map a symbol id in SBWorld to a cocos symbol node
        this.symbolsMap = {};
        this.world.onSymbolDestroy = this.onSymbolDestroy.bind(this);
    },

    start () {

    },

    onSpin()
    {
        this.resetReels();
        this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(()=>{
            this.startFall();
        })));
    },

    resetReels()
    {
        for (let i = 0; i < this.cols; i++)
        {
            this.node.runAction(cc.sequence(cc.delayTime(this.reelDelay*i), cc.callFunc(()=>{
                this.world.reels[i].reset();
            })));
        }
    },

    startFall()
    {
        for (let i = 0; i < this.cols; i++)
        {
            this.node.runAction(cc.sequence(cc.delayTime(this.reelDelay*i), cc.callFunc(()=>{
                this.startFallReel(i);
            })));
        }
    },

    onSymbolDestroy(symId)
    {
        let symNode = this.symbolsMap[symId];
        
        cc.tween(symNode).to(0.5, {opacity:0}).call(
            ()=>{
                this.table.removeChild(symNode);
                delete this.symbolsMap[symId];
            }
        ).start();
    },

    startFallReel(reelInd)
    {
        let reel = this.world.reels[reelInd];
        if (reel.isEmpty())
        {
            let ids = reel.startFall();
            for (let j = 0; j < ids.length; j++)
            {
                let type = Math.round(Math.random()*(this.symbols.length - 1));
                let sf = this.symbols[type];
                let node = new cc.Node();
                node.y = - 1000;
                //let sp = node.addComponent(cc.Sprite);
                //sp.spriteFrame = sf;
                let g = node.addComponent(cc.Graphics);
                g.fillColor = this.colors[type];
                g.fillRect(-this.symW/2, -this.symH/2, this.symW - 2, this.symH - 2);
                this.table.addChild(node);
                this.symbolsMap[ids[j]] = node;
            }
        }
    },

    update (dt) {
        this.world.update(dt);
        for (let i = 0; i < this.world.reels.length; i++)
        {
            let reel = this.world.reels[i];
            for (let j = 0; j < reel.symbols.length; j++)
            {
                let symbol = reel.symbols[j];
                let symNode = this.symbolsMap[symbol.id];
                symNode.x = reel.index*this.symW + this.symW/2;
                symNode.y = symbol.pos + this.symH/2;
            }
        }
    },
});
