export class SBSymbol
{
    id = 0;
    hitGround = true;
    pos = 0;
    v = 0;
    constructor(world, reel, rows, sw, sh)
    {
        this.world = world;
        this.reel = reel;
        this.w = sw;
        this.h = sh;
    }

    update(dt)
    {
        this.v += this.world.ga*dt;
        this.pos += v*dt;
        let elastic = 0.9;
        if (this.hitGround)
        {
            if (this.pos + this.sh < this.world.groundPos)
            {
                this.v = -this.v*elastic;
                this.pos = this.world.groundPos;
            }
        }

        for (let i = 0; i < this.reel.symbols.length; i++)
        {
            let sym = this.reel.symbols[i];
            if (sym == this) continue;
            if (this.pos > sym.pos && this.pos - sym.pos < this.sh)
            {
                this.pos = sym.pos + this.sh;
                if (this.v < 0) this.v = -this.v*elastic;
            }
            
            if (this.pos < sym.pos && sym.pos - this.pos < sym.sh)
            {
                this.pos = sym.pos - sym.sh;
                if (this.v > 0) this.v = -this.v*elastic;
            }
        }

        if (this.pos < -this.world.groundPos) this.reel.destroySymbol(this);

    }
}

export class SBReel
{
    symbols = [];

    constructor(world, rows, sw, sh)
    { 
        this.world = world;
        this.rows = rows;
    }

    clearSymbols()
    {
        for (let i = 0; i < this.symbols.length; i++)
        {
            this.destroySymbol(this.symbols[i]);
        }
    }

    destroySymbol(sym)
    {
        if (this.world.onSymbolDestroy) this.world.onSymbolDestroy(sym.id);
        for (let i = 0; i < this.symbols.length; i++)
        {
            if (this.symbols[i] == sym)
            {
                this.symbols.splice(i, 1);
                break;
            }
        }
    }

    startFall(anim = true)
    {
        for (let i = 0; i < this.symbols.length; i++)
        {
            this.symbols[i].hitGround = false;
        }
        let starPos = anim?this.rows*this.world.sh : this.world.groundPos + this.world.sh;
        let dis = anim?0:0;
        for (let i = 0; i < this.rows; i++)
        {
            let sym = new SBSymbol(world, this, this.sw, this.sh);
            this.symbols.push(sym);
            this.symbols.pos = startPos + (this.sh + dis)*i;
        }
    }

    update(dt)
    {
        for (let i = 0; i < this.symbols.length; i++)
        {
            this.symbols[i].update(dt);
        }
    }
}

export class SBWorld
{
    ga = -9.81*60*5; //gravity
    groundPos = 0;
    reels = [];

    onSymbolDestroy = null;
    sw = w;
    sh = h;
    constructor(cols, rows, sw, sh, groundPos = 0)
    {
        this.sw = sw;
        this.sh = sh;
        this.groundPos = groundPos;
        for (let i = 0; i < cols; i++)
        {
            let reel = new SBReel(this, rows, sw, sh);
            this.reels.push(reel);
        }
    }

    update(dt)
    {
        for (let i = 0; i < this.reels.length; i++)
        {
            this.reels[i].update(dt);
        }
    }
}