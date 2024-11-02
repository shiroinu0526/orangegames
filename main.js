//デバッグのフラグ
const DEBUG = false;

let drawCount = 0;
let fps = 0;
let lastTime = Date.now();

//スムージング
const SMOOTHING = false;

//ゲームスピード(ms)
const GAME_SPEED = 1000/60;

//画面サイズ
const SCREEN_W = 320;
const SCREEN_H = 320;

//キャンバスサイズ
const CANVAS_W = SCREEN_W * 2;
const CANVAS_H = SCREEN_H * 2;

//フィールドサイズ
const FIELD_W = SCREEN_W +120;
const FIELD_H = SCREEN_H + 40;

//ほしのかず
const STAR_MAX = 300;

//キャンバス
let can = document.getElementById("can");
let con = can.getContext("2d");
can.width = CANVAS_W;
can.height = CANVAS_H;

con.mozimageSmoothingEnabled = SMOOTHING;
con.webkitimageSmoothingEnabled = SMOOTHING;
con.msimageSmoothingEnabled = SMOOTHING;
con.imageSmoothingEnable = SMOOTHING;
con.font="20px'Impact'";
//フィールド（仮想画面）
let vcan = document.createElement("canvas");
let vcon = vcan.getContext("2d");
vcan.width = FIELD_W;
vcan.height = FIELD_H;
vcon.font="12px'Impact'";

let gameOver = false;
let gameStart = true;
let gameStop = false;

let score = 0;
let level = 0;
let zanki = 2;
let timer = 0;

let bossHP = 0;
let bossMHP = 0;

//カメラの座標
let camera_x = 0;
let camera_y = 0;

//ほしの配列
let star = [];

//キーボードの状態
let key=[];

let teki = [];
let teta = [];
let tama = [];
let expl = [];
let jiki = new Jiki();


//キャラクター読み込み
let spriteImage = new Image();
spriteImage.src = "sprite-3.png";


function gameInit()
{

}
for(let i=0;i<STAR_MAX;i++)star[i]=new Star();

setInterval(gameLoop, GAME_SPEED);

function updateObj(obj)
{
    for(let i=obj.length-1;i>=0;i--)
        {
            obj[i].update();
            if(obj[i].kill)obj.splice(i,1);
        }
}

function drawObj(obj)
{
    for(let i=0;i<obj.length;i++)obj[i].draw();
}

function updateAll()
{
    //移動の処理
    updateObj(star);
    updateObj(tama);
    updateObj(teta);
    updateObj(teki);
    updateObj(expl);
    if(!gameOver)jiki.update();
}

function drawAll()
{
    //描画の処理

    vcon.fillStyle=(jiki.damage)?"red":"black";
    vcon.fillRect(camera_x, camera_y, SCREEN_W, SCREEN_H);

    drawObj(star);
    drawObj(tama);
    if(!gameOver)jiki.draw();
    drawObj(teki);
    drawObj(expl);
    drawObj(teta);
    
    

    camera_x = Math.floor((jiki.x>>8)/FIELD_W * (FIELD_W-SCREEN_W));
    camera_y = Math.floor((jiki.y>>8)/FIELD_H * (FIELD_H-SCREEN_H));

    //ボスのhpを表示
    if(bossHP>0)
    {
        let sz = (SCREEN_W-20)*bossHP/bossMHP;

        vcon.fillStyle="rgba(235, 235, 0, 10)";
        vcon.fillRect(camera_x+10, camera_y+10, sz, 10);
    }



        //スコア表示
        vcon.fillStyle="white";
        vcon.fillText("SCORE:"+score, camera_x+10, camera_y+14);
        //レベル表示
        vcon.fillStyle = "white";
        vcon.fillText("LEVEL:"+level, camera_x+10, camera_y+24);
        //残機の表示
        vcon.fillStyle = "white";
        vcon.fillText("ZANKI:"+zanki, camera_x+280, camera_y+14);
        //タイマー表示
        vcon.fillStyle = "white";
        vcon.fillText("TIMER"+Math.floor(timer/60)+"s", camera_x+10, camera_y+34);
        //ver情報
        vcon.fillStyle = "white";
        vcon.fillText("ver1.9",camera_x+285, camera_y+315);

    //仮想画面から実際のキャンバスにコピー
    con.drawImage(vcan, camera_x,camera_y,SCREEN_W,SCREEN_H,
        0, 0, CANVAS_W, CANVAS_H);
}

function putInfo()
{
    con.fillStyle="white";

    if(gameOver)
    {
    let s = "GAME OVER";
    let w = con.measureText(s).width;
    let x = CANVAS_W/2 - w/2;
    let y = CANVAS_H/2 - 20;
    con.fillText(s, x, y);
    s = "Push 'R'key to restart!";
    w = con.measureText(s).width;
    x = CANVAS_W/2 - w/2;
    y = CANVAS_H/2 - 20 + 20;
    con.fillText(s, x, y);
    con.fillStyle = "green";
    s = "Level:"+level;
    w = con.measureText(s).width;
    x = CANVAS_W/2 - 80;
    y = CANVAS_H/2 - 20 + 40;
    con.fillText(s, x, y);
    s = "Time:"+Math.floor(timer/60)+"s";
    w = con.measureText(s).width;
    x = CANVAS_W/2 - 10;
    y = CANVAS_H/2 - 20 + 40;
    con.fillText(s, x, y);
    con.fillStyle="white";
    s = "Push 'SHIFT'key to restart!";
    w = con.measureText(s).width;
    x = CANVAS_W/2 - w/2;
    y = CANVAS_H/2 - 20 + 60;
    con.fillText(s, x, y);
    }

    if(gameStop)
    {
        {
        let s = "GAME START";
        let w = con.measureText(s).width;
        let x = CANVAS_W/2 - w/2;
        let y = CANVAS_H/2 - 20;
        con.fillText(s, x, y);
        s = "Push 'Y' to start!";
        w = con.measureText(s).width;
        x = CANVAS_W/2 - w/2;
        y = CANVAS_H/2 - 20 - 20;
        con.fillText(s, x, y);
        }
    }

    if(gameStart)
    {
    gameStop = false;
    let s = "GAME START";
    let w = con.measureText(s).width;
    let x = CANVAS_W/2 - w/2;
    let y = CANVAS_H/2 - 20;
    con.fillText(s, x, y);
    s = "Push 'E' to start!";
    w = con.measureText(s).width;
    x = CANVAS_W/2 - w/2;
    y = CANVAS_H/2 - 20 - 20;
    con.fillText(s, x, y);
    con.fillStyle="green"
    s = "'STG' ~fight!~";
    w = con.measureText(s).width;
    x = CANVAS_W/2 - w/2;
    y = CANVAS_H/2-100;
    con.fillText(s, x, y);
    }

    if(DEBUG)
        {
            drawCount++;
            if(lastTime +1000 <= Date.now())
            {
                fps=drawCount;
                drawCount = 0;
                lastTime = Date.now();
            }
    
    
            con.fillText("FPS:"+fps, 20, 20);
            con.fillText("Tama:"+tama.length, 20, 40);
            con.fillText("Teki:"+teki.length, 20, 60);
            con.fillText("Teta:"+teta.length, 20, 80);
            con.fillText("X:"+(jiki.x>>8), 20, 100);
            con.fillText("Y:"+(jiki.y>>8), 20, 120);
            con.fillText("HP:"+jiki.hp, 20, 140);
            con.fillText("score:"+score, 20, 160);
        }
}

let gameCount = 0;
let gameWave = 0;
let gameRound = 0;

let starSpeed = 100;
let starSpeedReq =100;
//ゲームループ
function gameLoop()
{
    
    gameCount++;
    if(starSpeedReq>starSpeed)starSpeed++;
    if(starSpeedReq<starSpeed)starSpeed--;
    if(gameWave == 0)
    {
    if(rand(0, 15)==1)
        {
            let r = rand(0, 1);
            teki.push(teki[0] = new Teki(0, rand(0, FIELD_W)<<8, 0,  0, rand(300, 1200)))
        }
        if(score == 3000)
        {
            gameWave++;
            gameCount = 0;
            starSpeedReq = 200;
        }
    }
    else if(gameWave == 1)
        {
        if(rand(0, 15)==1)
            {
                let r = rand(0, 1);
                teki.push(teki[0] = new Teki(1, rand(0, FIELD_W)<<8, 0,  0, rand(300, 1200)))
            }
            if(score>=7500)
            {
                gameWave++;
                gameCount = 0;
                starSpeedReq = 100
            }
        }
    else if(gameWave == 2)
        {
        if(rand(0, 10)==1)
            {
                let r = rand(0, 1);
                teki.push(teki[0] = new Teki(r, rand(0, FIELD_W)<<8, 0,  0, rand(300, 1200)))
            }
            if(gameCount > 60*10)
            {
                gameWave++;
                score = 0;
                gameCount = 0;
                starSpeedReq = 600;
                teki.push(teki[0] = new Teki(2, (FIELD_W/2)<<8, -(70<<8),  0, 200))
            }
        } 
    else if(gameWave == 3)
        {
            if(teki.length==0)
            {
                level++;
                score = 0;
                zanki++;
                gameWave++;
                gameCount = 0;
                starSpeedReq = 100;
            }
        }
    
    else if(gameWave == 4)
        {
        if(rand(0, 15)==1)
            {
                let r = rand(0, 1);
                teki.push(teki[0] = new Teki(4, rand(0, FIELD_W)<<8, 0,  0, rand(300, 1200)))
            }
            if(score == 3000)
            {
                gameWave++;
                gameCount = 0;
                starSpeedReq = 200;
            }
        }
    else if(gameWave == 5)
        {
        if(rand(0, 15)==1)
            {
                let r = rand(0, 1);
                teki.push(teki[0] = new Teki(5, rand(0, FIELD_W)<<8, 0,  0, rand(300, 1200)))
            }
            if(score == 7500)
            {
                gameWave++;
                gameCount = 0;
                starSpeedReq = 200;
            }
        }

    else if(gameWave == 6)
        {
        if(rand(0, 10)==1)
            {
                let r = rand(4, 5);
                teki.push(teki[0] = new Teki(r, rand(0, FIELD_W)<<8, 0,  0, rand(300, 1200)))
            }
            if(gameCount > 60*10)
            {
                gameWave++;
                zanki++;
                zanki++;
                jiki.muteki = 180;
                gameCount = 0;
                starSpeedReq = 600;
                teki.push(teki[0] = new Teki(6, (FIELD_W/2)<<8, -(70<<8),  0, 200))
            }
        }

    else if(gameWave == 7)
        {
            if(teki.length==0)
            {
                level++;
                score = 0;
                zanki++;
                gameWave++;
                gameCount = 0;
                starSpeedReq = 100;
            }
        }
    
    else if(gameWave == 8)
        {
        if(rand(0, 15)==1)
            {
                let r = rand(0, 1);
                teki.push(teki[0] = new Teki(7, rand(0, FIELD_W)<<8, 0,  0, rand(300, 1200)))
            }
            if(gameCount > 60*10)
            {
                gameWave++;
                gameCount = 0;
                level++;
                score = 0;
                starSpeedReq = 200;
            }
        }
    else if(gameWave == 9)
        {
        if(rand(0, 15)==1)
            {
                let r = rand(0, 1);
                teki.push(teki[0] = new Teki(8, rand(0, FIELD_W)<<8, 0,  0, rand(300, 1200)))
            }
            if(score == 3000)
            {
                gameWave++;
                gameCount = 0;
                starSpeedReq = 200;
            }
        }
    else if(gameWave == 10)
        {
        if(rand(0, 15)==1)
            {
                let r = rand(0, 1);
                teki.push(teki[0] = new Teki(9, rand(0, FIELD_W)<<8, 0,  0, rand(300, 1200)))
            }
            if(score == 7500)
            {
                gameWave++;
                gameCount = 0;
                starSpeedReq = 200;
            }
        }
    else if(gameWave == 11)
        {
        if(rand(0, 10)==1)        
            {
                let r = rand(8, 9);
                teki.push(teki[0] = new Teki(r, rand(0, FIELD_W)<<8, 0,  0, rand(300, 1200)))
            }
            if(gameCount > 60*10)
            {
                gameWave++;
                zanki++;
                gameCount = 0;
                starSpeedReq = 600;
                teki.push(teki[0] = new Teki(10, (FIELD_W/2)<<8, -(70<<8),  0, 200))
            }
        }

    else if(gameWave == 12)
        {
            if(teki.length==0)
            {
                level++;
                score = 0;
                zanki++;
                gameStop = true;
                gameWave = 0;
                gameCount = 0;
                starSpeedReq = 100;
            }
        }
    
    

    updateAll();
    drawAll();
    putInfo();
}

window.onload = function()
{
    gameInit();
    //teki.push(new Teki(2, (FIELD_W/2)<<8, 0, 0,200));
}
