//敵弾クラス
class Teta extends CharaBase
{
    constructor(sn, x, y, vx, vy, t)
    {
        super(sn, x, y, vx, vy);
        this.r = 3;
        if(t==undefined)this.timer=0;
        else this.timer = t;
    }
    update()
    {
        if(this.timer)
        {
            this.timer --;
            return;
        }
        super.update();

        if(!gameOver && !jiki.muteki && checkHit(
            this.x, this.y, this.r, 
            jiki.x, jiki.y, jiki.r))
        {
            this.kill=true;
            if(zanki == 0)
            {
                gameOver = true;
            }
            else
            {
                jiki.damage = 10;
                jiki.muteki = 60;
                zanki--;
            }
        }
        this.sn = 14 + ((this.count>>3)&1);
    }
}

//敵クラス
class Teki extends CharaBase
{
    constructor(t, x, y, vx, vy)
    {
        super(0, x, y, vx, vy);
        this.tnum = tekiMaster[t].tnum;
        this.r = tekiMaster[t].r;
        this.mhp = tekiMaster[t].hp;
        this.hp = this.mhp;
        this.score = tekiMaster[t].score;
        this.flag = false;
        this.dr = 90;
        this.relo = 0;

    }

    update()
    {
        if(this.relo)this.relo--;
        super.update(this);
        //個別のアップデート
        tekiFunc[this.tnum](this);
        if(!gameOver && gameWave == 8 && checkHit(
            this.x, this.y, this.r, 
            jiki.x, jiki.y, jiki.r))
        {
            if(this.mhp<500) this.kill=true;
            if(zanki > 0)
            {
                zanki++;
            }
        }

        if(!gameOver && !jiki.muteki && checkHit(
            this.x, this.y, this.r, 
            jiki.x, jiki.y, jiki.r))
        {
            if(this.mhp<500) this.kill=true;
            if((zanki == 0))
            {
                gameOver = true;
            }
            else
            {
            jiki.damage = 10;
            jiki.muteki = 60;
            zanki--;
            }
        }
    }
}

function tekiShot(obj, speed)
{
    if(gameOver)return;

    let px = (obj.x>>8);
    let py = (obj.y>>8);

    if(px-40 <camera_x || px+40 >=camera_x+SCREEN_W ||
        py-40 <camera_y || py+40 >=camera_y+SCREEN_H)return;
    let an, dx, dy;
    an = Math.atan2(jiki.y-obj.y, jiki.x-obj.x);
    dx = Math.cos(an)*speed;
    dy = Math.sin(an)*speed;

    teta.push(new Teta(15, obj.x, obj.y, dx, dy));
}

//ピンクのひよこ
function tekiMove01(obj)
{
    if(!obj.flag)
    {
        if(jiki.x > obj.x && obj.vx < 120)obj.vx += 4;
        else if(jiki.x < obj.x && obj.vx >-120)obj.vx -= 4;
    }
    else
    {
        if(jiki.x < obj.x && obj.vx < 400)obj.vx += 4;
        else if(jiki.x > obj.x && obj.vx >-400)obj.vx -= 30;
    }
    
    if(Math.abs(jiki.y-obj.y) < (100<<8) && !obj.flag)
    {
        obj.flag = true;
        tekiShot(obj, 600);
    }
    if(obj.flag && obj.vy > -800)obj.vy-=30;

    const ptn = [39, 40, 39, 41];
    obj.sn = ptn[(obj.count>>3)&3];
}


//黄色のひよこ
function tekiMove02(obj)
{
    if(!obj.flag)
        {
            if(jiki.x > obj.x && obj.vx < 600)obj.vx += 30;
            else if(jiki.x < obj.x && obj.vx >-600)obj.vx -= 30;
        }
        else
        {
            if(jiki.x < obj.x && obj.vx < 400)obj.vx += 4;
            else if(jiki.x > obj.x && obj.vx >-400)obj.vx -= 30;
        }
        
        
        if(Math.abs(jiki.y-obj.y) < (100<<8) && !obj.flag)
        {
            obj.flag = true;

            tekiShot(obj, 600)
        }

        const ptn = [33, 34, 33, 35];
        obj.sn = ptn[(obj.count>>3)&3];
}
//ボスひよこ

function tekiMove03(obj)
{
    if(!obj.flag && (obj.y>>8)>=60)obj.flag = 1;
    if(obj.flag==1)
    {
        if((obj.vy-=2)<=0)
        {
            obj.flag=2;
            obj.vy = 0;
        }
    }
    else if(obj.flag==2)
    {
        if(obj.vx<300)obj.vx+=10;
        if((obj.x>>8) > (FIELD_W-100))obj.flag=3;
    }
    else if(obj.flag==3)
    {
        if(obj.vx>-300)obj.vx-=10;
        if((obj.x>>8)<100)obj.flag=2;
    }

    if(obj.flag>1)
    {
        let an, dx, dy;
        an = obj.dr * Math.PI/180;
        dx = Math.cos(an)*600;
        dy = Math.sin(an)*600;
        let x2 = Math.cos(an)*70;
        let y2 = Math.sin(an)*70;
        teta.push(new Teta(15, obj.x+x2, obj.y+y2, dx, dy));
    

    if((obj.dr+=15)>=360)obj.dr=0;
    }

    if(obj.hp<obj.mhp/2)
    {
        let c = obj.count%(60*5);
        if(c/10<4 && c%10==0)
        {
            let an, dx, dy;
            an = (90+45-(c/10)*30) * Math.PI/180;
            dx = Math.cos(an)*300;
            dy = Math.sin(an)*300;
            let x2 = (Math.cos(an)* 70)<<8;
            let y2 = (Math.sin(an)*70)<<8;
            teki.push(new Teki(3, obj.x+x2, obj.y+y2, dx, dy));
        }
    }

    obj.sn = 75
}

function tekiMove04(obj)
{
    if(obj.count == 10)
    {
        obj.vy=obj.vy=0;
    }
    if(obj.count == 60)
    {
        if(obj.x > jiki.x)obj.vx=-30;
        else obj.vx=30;
        obj.vy=100;
    }
    if(obj.count > 100 && !obj.relo)
    {
        if(rand(0, 100)==1)
        {
            tekiShot(obj, 300);
            obj.relo = 200;

        }
    }
    const ptn = [33, 34, 33, 35];
    obj.sn = ptn[(obj.count>>3)&3];
}

//青グラサン
function tekiMove05(obj)
{
    if(!obj.flag)
        {
            if(jiki.x > obj.x && obj.vx < 600)obj.vx += 30;
            else if(jiki.x < obj.x && obj.vx >-600)obj.vx -= 30;
        }
        else
        {
            if(jiki.x < obj.x && obj.vx < 400)obj.vx += 4;
            else if(jiki.x > obj.x && obj.vx >-400)obj.vx -= 30;
        }
        
        
        if(Math.abs(jiki.y-obj.y) < (100<<8) && !obj.flag)
        {
            obj.flag = true;

            tekiShot(obj, 600)
        }

        const ptn = [44, 45, 44, 46];
        obj.sn = ptn[(obj.count>>3)&3];
}

//ロボット
function tekiMove06(obj)
{
    if(!obj.flag)
        {
            if(jiki.x > obj.x && obj.vx < 600)obj.vx += 30;
            else if(jiki.x < obj.x && obj.vx >-600)obj.vx -= 30;
        }
        else
        {
            if(jiki.x < obj.x && obj.vx < 400)obj.vx += 4;
            else if(jiki.x > obj.x && obj.vx >-400)obj.vx -= 30;
        }
        
        
        if(Math.abs(jiki.y-obj.y) < (100<<8) && !obj.flag)
        {
            obj.flag = true;

            tekiShot(obj, 600)
        }

        const ptn = [50, 51, 50, 52];
        obj.sn = ptn[(obj.count>>3)&3];
}

//青グラサンボスひよこ
function tekiMove07(obj)
{
    if(!obj.flag && (obj.y>>8)>=60)obj.flag = 1;
    if(obj.flag==1)
    {
        if((obj.vy-=2)<=0)
        {
            obj.flag=2;
            obj.vy = 0;
        }
    }
    else if(obj.flag==2)
    {
        if(obj.vx<300)obj.vx+=10;
        if((obj.x>>8) > (FIELD_W-100))obj.flag=3;
    }
    else if(obj.flag==3)
    {
        if(obj.vx>-300)obj.vx-=10;
        if((obj.x>>8)<100)obj.flag=2;
    }

    if(obj.flag>1)
    {
        let an, dx, dy;
        an = obj.dr * Math.PI/180;
        dx = Math.cos(an)*600;
        dy = Math.sin(an)*600;
        let x2 = Math.cos(an)* 100;
        let y2 = Math.sin(an)*100;
        teta.push(new Teta(15, obj.x+x2, obj.y+y2, dx, dy));
    

    if((obj.dr+=15)>=360)obj.dr=0;
    }

    if(obj.hp<obj.mhp/2)
    {
        let c = obj.count%(60*5);
        if(c/10<4 && c%10==0)
        {
            let an, dx, dy;
            an = (90+45-(c/10)*30) * Math.PI/180;
            dx = Math.cos(an)*300;
            dy = Math.sin(an)*300;
            let x2 = (Math.cos(an)* 70)<<8;
            let y2 = (Math.sin(an)*70)<<8;
            teki.push(new Teki(4, obj.x+x2, obj.y+y2, dx, dy));
        }
    }

    obj.sn = 77
}

//卵
function tekiMove08(obj)
{
    if(!obj.flag)
        {
            if(jiki.x > obj.x && obj.vx < 600)obj.vx += 30;
            else if(jiki.x < obj.x && obj.vx >-600)obj.vx -= 30;
        }
        else
        {
            if(jiki.x < obj.x && obj.vx < 400)obj.vx += 4;
            else if(jiki.x > obj.x && obj.vx >-400)obj.vx -= 30;
        }
        
        
        if(Math.abs(jiki.y-obj.y) < (100<<8) && !obj.flag)
        {
            obj.flag = true;
        }

        const ptn = [62, 63, 62, 64];
        obj.sn = ptn[(obj.count>>3)&3];
}

//ニワトリ
function tekiMove09(obj)
{
    if(!obj.flag)
        {
            if(jiki.x > obj.x && obj.vx < 600)obj.vx += 30;
            else if(jiki.x < obj.x && obj.vx >-600)obj.vx -= 30;
        }
        else
        {
            if(jiki.x < obj.x && obj.vx < 400)obj.vx += 4;
            else if(jiki.x > obj.x && obj.vx >-400)obj.vx -= 30;
        }
        
        
        if(Math.abs(jiki.y-obj.y) < (100<<8) && !obj.flag)
        {
            obj.flag = true;

            tekiShot(obj, 600)
        }

        const ptn = [56, 57, 56, 58];
        obj.sn = ptn[(obj.count>>3)&3];
}


//脱帽ニワトリ
function tekiMove10(obj)
{
    if(!obj.flag)
        {
            if(jiki.x > obj.x && obj.vx < 600)obj.vx += 30;
            else if(jiki.x < obj.x && obj.vx >-600)obj.vx -= 30;
        }
        else
        {
            if(jiki.x < obj.x && obj.vx < 400)obj.vx += 4;
            else if(jiki.x > obj.x && obj.vx >-400)obj.vx -= 30;
        }
        
        
        if(Math.abs(jiki.y-obj.y) < (100<<8) && !obj.flag)
        {
            obj.flag = true;

            tekiShot(obj, 600)
        }

        const ptn = [67, 68, 67, 69];
        obj.sn = ptn[(obj.count>>3)&3];
}

//ピンクのひよこ
function tekiMove11(obj)
{
    if(!obj.flag && (obj.y>>8)>=60)obj.flag = 1;
    if(obj.flag==1)
    {
        if((obj.vy-=2)<=0)
        {
            obj.flag=2;
            obj.vy = 0;
        }
    }
    else if(obj.flag==2)
    {
        if(obj.vx<300)obj.vx+=10;
        if((obj.x>>8) > (FIELD_W-100))obj.flag=3;
    }
    else if(obj.flag==3)
    {
        if(obj.vx>-300)obj.vx-=10;
        if((obj.x>>8)<100)obj.flag=2;
    }

    if(obj.flag>1)
    {
        let an, dx, dy;
        an = obj.dr * Math.PI/180;
        dx = Math.cos(an)*600;
        dy = Math.sin(an)*600;
        let x2 = Math.cos(an)* 100;
        let y2 = Math.sin(an)*100;
        teta.push(new Teta(15, obj.x+x2, obj.y+y2, dx, dy));
    

    if((obj.dr+=15)>=360)obj.dr=0;
    }

    if(obj.hp<obj.mhp/2)
    {
        let c = obj.count%(60*5);
        if(c/10<4 && c%10==0)
        {
            let an, dx, dy;
            an = (90+45-(c/10)*30) * Math.PI/180;
            dx = Math.cos(an)*300;
            dy = Math.sin(an)*300;
            let x2 = (Math.cos(an)* 70)<<8;
            let y2 = (Math.sin(an)*70)<<8;
            teki.push(new Teki(0, obj.x+x2, obj.y+y2, dx, dy));
        }
    }

    obj.sn = 76
}

let tekiFunc = [
    tekiMove01,
    tekiMove02,
    tekiMove03,
    tekiMove04,
    tekiMove05,
    tekiMove06,
    tekiMove07,
    tekiMove08,
    tekiMove09,
    tekiMove10,
    tekiMove11,
];
