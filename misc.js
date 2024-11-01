//キーボードが押された時
document.onkeydown = function(e)
{
    key[e.keyCode] = true;
    if(gameOver && e.keyCode==82)
    {
        delete jiki;
        this.kill = true;
        jiki = new Jiki();
        gameOver = false;
        jiki.muteki = 120;
        zanki = 2;
        gameWave = 0;
        score = 0;
        level = 1;
        timer = 0;
    }

    key[e.keyCode] = true;
    if(e.keyCode==13)
    {
        gameStop =true;
        
    }


    key[e.keyCode] = true;
    if(gameStop && e.keyCode==89)
    {
        gameStop = false;
        jiki.muteki = 120;
    }

    key[e.keyCode] = true;
    if(gameStart && e.keyCode==69)
    {
        gameStart = false;
        jiki.muteki =120;
        gameWave = 0;
        score = 0;
        level = 1;
    }


    key[e.keyCode] = true;
    if(e.keyCode == 84)
    {
        zanki--;
        jiki.muteki = 120;
        if(zanki < 0)
        {
            gameOver =true;
        }
        
    }
}

//キーボードが放せれた時
document.onkeyup = function(e)
{
    key[e.keyCode] = false;
}



class Star
{
    constructor()
    {
        this.x = rand(0, FIELD_W)<<8;
        this.y = rand(0, FIELD_H)<<8;
        this.vx = 0;
        this.vy = rand(30, 200);
        this.sz = rand(1, 2);
    }

    update()
    {
        this.x += this.vx * starSpeed/100;
        this.y += this.vy * starSpeed/100;
        if(this.y > FIELD_H<<8){
            this.x = FIELD_W<<8
        }
    }

    draw()
    {
        let x = this.x>>8;
        let y = this.y>>8;
        if(x<camera_x || x>=camera_x+SCREEN_W ||
            y<camera_y || y>=camera_y+SCREEN_H)return;
        vcon.fillStyle = (rand(0, 2) !=0)?"#66f":"#aef";
        vcon.fillRect(x, y, this.sz, this.sz);

    }
}

//キャラクターのベースクラス
class CharaBase
{
    constructor(snum, x, y, vx, vy)
    {
        this.sn = snum;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.kill = false;
        this.count = 0;
    }
    update()
    {
        this.count++;
        this.x += this.vx;
        this.y += this.vy;

        if(this.x+(100<<8)<0 || this.x-(100<<8)>FIELD_W<<8
            || this.y+(100<<8)<0 || this.y-(100<<8)>FIELD_H<<8)this.kill = true;
    }
    
    draw()
    {
        drawSprite(this.sn, this.x, this.y)
    }
}


//爆発
class Expl extends CharaBase
{
    constructor(c, x, y, vx, vy)
    {
        super(0, x, y, vx, vy)
        this.timer = c;
    }
    update()
    {
        if(this.timer)
        {
            this.timer--;
            return;
        }
        super.update();
    }
    draw()
    {
        this.sn = 16 + (this.count>>2);
        if(this.sn == 27)
            {
                this.kill = true;
                return;
            }
        super.draw();
    }
}

function explotion(x, y, vx, vy)
{
    expl.push(new Expl(0, x, y, vx, vy));
    for(let i=0;i<10;i++)
    {
        let evx = vx+(rand(-10, 10)<<5);
        let evy = vy+(rand(-10, 10)<<5);
        expl.push(new Expl(i, x, y, evx, evy));
    }
}

//スプライトを描画する
function drawSprite(snum, x, y)
{
    let sx = sprite[snum].x;
    let sy = sprite[snum].y;
    let sw = sprite[snum].w;
    let sh = sprite[snum].h;

    let px = (x>>8) - sw / 2;
    let py = (y>>8) - sh / 2;
    if(px+sw <camera_x || px >=camera_x+SCREEN_W ||
        py+sh <camera_y || py >=camera_y+SCREEN_H)return;
    vcon.drawImage(spriteImage, sx, sy, sw, sh, px, py, sw, sh);

}


//正数のランダム
function rand(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//当たり判定
function checkHit(x1, y1, r1, x2, y2, r2)
{
    /*矩形どうしの当たり判定
    let left1 = x1>>8;
    let right1 = left1+w1;
    let top1 = y1>>8;
    let bottom1 = top1+h1;

    let left2 = x2>>8;
    let right2 = left2+w2;
    let top2 = y2>>8;
    let bottom2 = top2+h2;

    return(left1 <= right2 &&
        right1 >=left2 &&
        top1<= bottom2 &&
        bottom1 >= top2);
    */
    //円の当たり判定
    let a = (x2-x1)>>8;
    let b = (y2-y1)>>8;
    let r = r1+r2;

    return r*r >= a*a + b*b;


}
