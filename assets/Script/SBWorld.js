export class SBSymbol
{
    id = 0;
    active = true;
    pos = 0;
    v = 0;
    elastic = 0.23;
    constructor(world, reel, sw, sh)
    {
        this.world = world;
        this.reel = reel;
        this.sw = sw;
        this.sh = sh;
    }

    updatePos(dt)
    {
        this.v += this.world.ga*dt;
        this.pos += this.v*dt;
    }

    updateCollision()
    {
        let elastic = this.elastic;
        let hit = false;
        
        if (this.active)
        {
            if (this.pos < this.world.groundPos)
            {
                this.pos = this.world.groundPos;
                hit = true;
                if (this.v < 0) this.v = -this.v*elastic;
            }

            if (!hit) for (let i = 0; i < this.reel.symbols.length; i++)
            {
                let sym = this.reel.symbols[i];
                if (sym == this) continue;
                if (this.pos > sym.pos && this.pos - sym.pos < sym.sh)
                {
                    this.pos = sym.pos + sym.sh;
                    if (this.v < 0) this.v = -this.v*elastic;
                    break;
                }
                
                if (!hit && this.pos < sym.pos && sym.pos - this.pos < sym.sh)
                {
                    this.pos = sym.pos - this.sh;
                    if (this.v > 0) this.v = -this.v*elastic;
                    break;
                }
            }
        }
        
        if (this.pos < this.world.groundPos - this.sh*2) this.reel.destroySymbol(this);
    }

}

export class SBReel
{
    index;
    symbols = [];

    constructor(world, rows, sw, sh)
    { 
        this.world = world;
        this.rows = rows;
        this.sw = sw;
        this.sh = sh;
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

    isEmpty()
    {
        for (let i = 0; i < this.symbols.length; i++)
        {
            if (this.symbols[i].active) return false;
        }
        return true;
    }

    reset()
    {
        for (let i = 0; i < this.symbols.length; i++)
        {
            this.symbols[i].active = false;
        }
    }

    startFall(anim = true)
    {
        let ids = [];
        let startPos = anim?this.rows*this.sh : this.world.groundPos;
        let dis = this.sh*0.05;
        for (let i = 0; i < this.rows; i++)
        {
            let sym = new SBSymbol(this.world, this, this.sw, this.sh);
            if (i == 1) sym.elastic = 0.45;
            this.symbols.push(sym);
            sym.pos = startPos + (this.sh + dis)*(i + 1);
            sym.id = this.world.getSymId();
            ids.unshift(sym.id);
        }

        return ids;
    }

    update(dt)
    {
        for (let i = 0; i < this.symbols.length; i++)
        {
            this.symbols[i].updatePos(dt);
        }

        for (let i = 0; i < this.symbols.length; i++)
        {
            this.symbols[i].updateCollision(dt);
        }
    }
}

export class SBWorld
{
    symId = 0;
    ga = -9.81*60*3; //gravity
    groundPos = 0;
    reels = [];

    onSymbolDestroy = null;
    sw = 0;
    sh = 0;
    constructor(cols, rows, sw, sh, groundPos = 0)
    {
        this.sw = sw;
        this.sh = sh;
        this.groundPos = groundPos;
        for (let i = 0; i < cols; i++)
        {
            let reel = new SBReel(this, rows, sw, sh);
            reel.index = i;
            this.reels.push(reel);
        }
    }

    getSymId()
    {
        this.symId++;
        if (this.symId > 0x7FFFFFFF - 1) this.symId = 0;
        return this.symId;
    }

    update(dt)
    {
        for (let i = 0; i < this.reels.length; i++)
        {
            this.reels[i].update(dt);
        }
    }
}