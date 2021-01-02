
    


// SURVIVAL DUCKHUNT //
// 2020, code by Nicolas Chenard nicolaschenard@gmail.com  
var ccc=100;
///////////////////////////////////// initialisations CSS :

    document.body.style.margin="0";
    document.body.style.padding="0";
    document.body.style.borderStyle="border-box";
    document.body.style.backgroundColor="rgb(008, 207, 255)";
    document.body.style.userSelect="none";

///////////////////////////////////// mise en place des objets sounds :
var snds=['barkX3','bgm','canard','falling','ground','run','run2','select','shoot','fly'];//
for (let i of snds){
    window[i] = new Audio(`./snd/${i}.ogg`);
}

function snd(x){
    x.loop=false;
    x.currentTime = 0;
    x.play();
}

///////////////////////////////////// init des variables / objets :
let ducksTab=[];
let spritesCont = document.createElement('div');
duckTitre=[[200,window.innerHeight-350],[window.innerWidth-300,100],[window.innerWidth-200,200],[window.innerWidth-350,350]];
anim={seq:[0,1,2,1], flyAwaySeq:[0,1,2,3], ref:{'hh':0,'hd':102,'dd':204,'bd':306,'bb':408,'bg':510,'gg':612,'hg':714,'tt':816,'ff':918,"ii":1020},"fa":1122};
game={chienIn:0,flewAway:0,vivants:0,tombes:0,mode:0, tirOn:0, tt:1, population:10, viesCanard:3,viesChasseur:3};
time={pas:500, turbo:1, pos:342};
spritesMap=new Map();// obj sprites sont référencés ici (clé est la même que l'ID du div)
scroll={active:1,posX:0}; // scrolling du décors
mouse={x:0,y:0};

///////////////////////////////////// fonctions générales : 


function rand(x){return(Math.round(Math.random()*x))}

function posiNegaZeroDemi(){//retourne : 1 / -1 / 0 / 0.5 / -0.5
    let r=1;
    rand(1)?r=-1:r=1;
    if(rand(10)<2)r=0;
    if(rand(10)<4)r*=.5;
    return(r);
}

///////////////////////////////////// fonction de création parent / enfant
function creerContainer(x,parnt,w,h){
    window[x]=document.createElement('div');
   
        window[x].style.width=w;
        window[x].style. height=h;
        window[x].style.overflow="hidden";
        window[x].style.position="absolute";     
    
    window[x].id=x;
    parnt.appendChild(window[x]);
}

function createChild(n,fichier, w,h,parnt){
    window[n]=document.createElement('div');
    
        window[n].style.width=w;
        window[n].style.height=h;
        window[n].style.backgroundImage=`url('./img/${fichier}.png')`;
        window[n].style.position="absolute";
        window[n].style.backgroundRepeat="no-repeat";
        window[n].style.pointerEvents="none"; 
    
    window[n].id=fichier;
    document.querySelector('#'+parnt).appendChild(window[n]);
}

///////////////////////////////////// creation des elements visuels (décors / sprites...)

creerContainer('spritesContainer', document.body,"100vw","100vh")

createChild("fd","fond",window.innerWidth+200+"px",'698px','spritesContainer');//montagnes    

    fd.style.bottom="60px";
    fd.style.left="0px";
    fd.style.backgroundRepeat="repeat-x";
    fd.style.visibility='hidden';


createChild("dec","decors",window.innerWidth*3+"px",'800px','spritesContainer');//décors :

    dec.style.bottom="0px";
    dec.style.left="0px";
    dec.style.backgroundRepeat="repeat-x";
    dec.style.zIndex="999";
    dec.style.visibility='hidden';


///////////////////////////////////// le chien

dog={cpt:0,cptCatch:0,sens:1,d2Y:50,intro:[0,-90,-180,-270,-360,-450]}

createChild('d1','chien',"90px","150px",'spritesContainer') //d1 chien qui court
d1.style.zIndex="500"
d1.style.bottom="200px"

function dogAnim(onOff){
    if(onOff==1){
        d1.style.visibility="visible"
        if(++dog.cpt==6)dog.cpt=0;
        d1.style.backgroundPosition=dog.intro[dog.cpt]+'px 0px' ;
        dogTO=setTimeout(() => {
            dogAnim(onOff)
        }, 70);
    }else{
        clearTimeout(dogTO);
        d1.style.visibility="hidden";
    }
}

createChild('d2','chien2',"170px","170px",'spritesContainer')//d2 : chien qui ramasse
d2.style.bottom=dog.d2Y+'px';

function dogCatch(x){
    game.chienIn=1;
    dog.cptCatch++<30? dog.sens=5:dog.sens=-5;
    if(dog.cptCatch==30)snd(barkX3);
    if(dog.cptCatch>30&&dog.cptCatch<90)dog.sens=0;
    if(dog.cptCatch<120){
        dog.d2Y+=dog.sens;
        d2.style.bottom=dog.d2Y+'px';
        d2.style.left=x+'px';
        dogTO=setTimeout(() => {
            dogCatch();
        }, 16);
    }else{
        dog.cptCatch=0;
        game.chienIn=0;
/////////////////////////// mode 2 joueurs, relance player duck0:
        if(game.mode==2)launchDuck0();
////////////////////////// mode 1 joueur, check nombres de ducks et lance une salve si population == 0 canard:
        if(game.mode==1 && game.flewAway==0){
            if(ducksTab.length==0){
                if(game.population<=29)game.population++;
                    launchDuck(game.population);
                    }
                }
        setTimeout(() => {
            game.tombes=0;
       }, 2000);
    }
}
dogAnim(1)
dogAnim(0)

function gameOverSeq(x){
    canard.pause();
    afficheMessage(x);
    bgm.pause();
    snd(run2);
    game.viesCanard=3;
    game.viesChasseur=3;
    game.tirOn=0;
    flush();
    setTimeout(() => {
        titreLaunch();
    }, 5000);
}

///////////////////////////////////// mise en place du titre
creerContainer('titleContainer',document.body,"100vw","100vh")

    document.querySelector('#titleContainer').style.zIndex="2000";
    document.querySelector('#titleContainer').style.display='flex';
    document.querySelector('#titleContainer').style.justifyContent='center'
    document.querySelector('#titleContainer').style.alignItems='center'
    document.querySelector('#titleContainer').style.visibility='hidden'


creerContainer('titleFond',document.querySelector('#titleContainer'),"100vw","100vh")

    document.querySelector('#titleFond').style.backgroundColor="rgba(0,0,0,0.5)";

creerContainer('titleImg',document.querySelector('#titleContainer'),"768px","672px")

    document.querySelector('#titleImg').style.backgroundImage=`url('./img/titre.png')`;
    document.querySelector('#titleImg').style.backgroundRepeat="no-repeat";


document.querySelector("#decors").style.left=scroll.posX+"px";

// bouttons game A :
creerContainer('gamea',document.querySelector('#titleImg'),'399px','40px')

    document.querySelector('#gamea').style.backgroundImage=`url('./img/game_a.png')`;
    document.querySelector('#gamea').style.left='180px';
    document.querySelector('#gamea').style.top='400px';

// bouttons game B :
creerContainer('gameb',document.querySelector('#titleImg'),'423px','40px')

    document.querySelector('#gameb').style.backgroundImage=`url('./img/game_b.png')`;
    document.querySelector('#gameb').style.left='180px';
    document.querySelector('#gameb').style.top='460px'


document.querySelector('#gamea').onmouseover=function(){this.style.opacity='0.5';snd(select)}
document.querySelector('#gamea').onmouseout=function(){this.style.opacity='1'}
document.querySelector('#gameb').onmouseover=function(){this.style.opacity='0.5',snd(select)}
document.querySelector('#gameb').onmouseout=function(){this.style.opacity='1'}

///////////////////////////////////// scrolling du décors
function scrollDecors(onOff){
    if(onOff==1){
        scroll.posX-=3;
        if(scroll.posX<=-1736)scroll.posX=0;
        document.querySelector("#decors").style.left=scroll.posX+"px";
        scrollTO=setTimeout(() => {
            scrollDecors(onOff)
        }, 16);   
    }else{clearTimeout(scrollTO)}
}
scrollDecors(1);
scrollDecors(0);
///////////////////////////////////// MESSAGES

creerContainer('messagesContainer',document.body,"100vw","100vh")

    document.querySelector('#messagesContainer').style.zIndex="3000";
    document.querySelector('#messagesContainer').style.display='flex';
    document.querySelector('#messagesContainer').style.justifyContent='center'
    document.querySelector('#messagesContainer').style.alignItems='center'
    document.querySelector('#messagesContainer').style.pointerEvents='none'


creerContainer('messagesFond',document.querySelector('#messagesContainer'),"315px","63px")
document.querySelector('#messagesFond').style.backgroundImage="url('./img/messagesFond.png')";
createChild('messageTxt','messagesTxt','315px','63px','messagesContainer')

function afficheMessage(pos){
    document.querySelector('#messagesContainer').style.visibility='visible';
    document.querySelector('#messagesTxt').style.backgroundPosition=`0px ${pos}px`;
    if(pos=="out")document.querySelector('#messagesContainer').style.visibility='hidden'; 
}
afficheMessage(0);
afficheMessage("out");

///////////////////////////////////// écran titre ,choix du mode de jeu : 

document.querySelector('#gamea').onclick=function(){
    startGame(1);
}
document.querySelector('#gameb').onclick=function(){
    startGame(2);
}

/////////////////////// SCORE CONTAINER
creerContainer('scoreContainer', document.body,"100%","100px")

    scoreContainer.style.bottom="0px";
    scoreContainer.style.zIndex="2300";
    scoreContainer.style.display="flex";
    scoreContainer.style.justifyContent="space-around"
    scoreContainer.style.alignItems="center"
    scoreContainer.style.visibility="hidden";


/////////////////////// creation barre time
creerContainer('timeContainer', scoreContainer,"357px","36px")
createChild("timeFond","time1","357px","36px",'timeContainer');  
creerContainer('time2', document.querySelector('#timeContainer'),"333px","12px")

    time2.style.top="12px";
    time2.style.left="12px";

createChild("timeBleu","time2","333px","12px",'time2');
createChild("timeRouge","time3","333px","12px",'time2');
timeRouge.style.left="180px";

document.querySelector('#timeContainer').style.position='relative'

function timeLoop(){
    time.pos-=6;
    timeRouge.style.left=time.pos+"px";
    /////////////////////////////////// fin de temps
    if(time.pos<=0){
        // clearTimeout(barTO);
      if(game.mode==1){

        for(let i=0; i<ducksTab.length;i++){
            spritesMap.get(ducksTab[i]).flyAway();
        }



setTimeout(() => {
    flush();
    gameOverSeq(-189)
//     afficheMessage(-189)
//     snd(run2)
//     setTimeout(() => {
//     titreLaunch();   
//     }, 3000);
}, 2000);

}
      if(game.mode==2){
        spritesMap.get('duck0').flyAway();
    }
    }else{
    barTO=setTimeout(() => {
        timeLoop();        
    }, time.pas);
    }
}

function timeBar(x){   
    
    switch (x){
        case 'out':
            document.querySelector('#scoreContainer').style.visibility='hidden';
        break;
        case 'in':
            time.pos=342;
            timeRouge.style.left="342px";
            document.querySelector('#scoreContainer').style.visibility='visible';
        break;
        case 'go':
            timeLoop();
        break;
        case 'stop':
            clearTimeout(barTO);
        break;
    }
}

//////////////////////// CLASSE SPRITES (regroupe les canards et les nuages)

class Sprite{
    constructor(cible,id,cote){
        this.x=0;
        this.y=0;
        this.sensX=0;
        this.sensY=0;
        this.cote=cote;
        this.pas=4;
        this.animCpt=0;
        this.flyAwayCpt=0;
        this.animRef='dd';
        this.animRate=90;
        this.turbo=1;
        this.color=1;
        this.colorTab=[-306,-612]
        this.aiCpt=0;
        this.elm = document.createElement('div');
        this.elm.style.backgroundImage="url('./img/"+cible+".png')";
        this.elm.id=cible+id;
        this.id=cible+id;
        this.elm.style.position="absolute";
        this.elm.style.backgroundRepeat="no-repeat";
        this.elm.style.height=this.cote+"px";
        this.elm.style.width=this.cote+"px";
        spritesMap.set(this.id, this)//ajout de l'obj dans map
document.querySelector('#spritesContainer').appendChild(this.elm);

this.elm.style.visibility='hidden';

    }

    init(x,y,sx,sy){
        rand(10)<7?this.color=0:this.color=this.colorTab[rand(1)];//couleur du canard
        this.x=x;
        this.y=y;
        this.sensX=sx;
        this.sensY=sy;
        this.animRate=90;
        this.aiCpt=140;
        this.elm.style.top=y+"px";
        this.elm.style.left=x+"px";
        this.animRef="hd"
        this.flyAwayCpt=0;
        this.elm.style.pointerEvents="auto"; 
        this.pas=5;
        if(sx<5)this.animation();
        this.elm.style.visibility='visible';
        this.elm.style.zIndex=10+this.id;
    }

    placeImg(x,y){
        this.elm.style.backgroundPosition=`${x}px -${y}px`;
    }

    supprime(){
        this.animRate=90;
        clearTimeout(this.TO)
        ducksTab.splice(ducksTab.indexOf(this.id),1);
        this.elm.style.visibility='hidden';
     }

    touche(){
        if(game.mode==2){game.viesCanard--}
        if(game.mode==1){
        game.vivants--;

        setTimeout(() => {
            if(game.vivants==1){
          
               
                snd(canard);
                canard.loop=true;
                spritesMap.get(ducksTab[0]).pas=7;
            }
        }, 1500);
            
            if(game.vivants==0)timeBar('stop');
        }

        snd(canard);
        this.sensX=0;
        this.sensY=0;
        this.elm.style.pointerEvents='none';
        if(game.mode==2){
            controlOnOff(0);
            timeBar('stop');
        }
        clearTimeout(this.TO)
        this.animCpt=1;
        this.animRef='tt';
        this.placeImg(this.color+this.cote*-anim.seq[this.animCpt],anim.ref[this.animRef]);
        this.sensX=0;
        this.sensY=0;
        this.animRate=220
        this.TO=setTimeout(() => {
            this.animRef='ff';
            this.placeImg(this.color,anim.ref[this.animRef]);
            this.animation();
            snd(falling);
            this.tombe();
        }, 500);
    }
    tombe(){        
        this.pas=7;
        this.sensY=1;
        setTimeout(() => {
            if(this.y>window.innerHeight-200){
                falling.pause();
                snd(ground);
                this.supprime();
                game.tombes++;
                if(!dog.cptCatch){;
                    game.tombes<2?d2.style.backgroundPosition='0px 0px':d2.style.backgroundPosition='-170px 0px';
                    setTimeout(() => {
                       if(game.flewAway==0&&game.chienIn==0)dogCatch(this.x); 
                    }, 400);
                    game.tombes=0;
                }
            }
            else{ this.tombe();}
        }, 100);
    }

    bouge(){
        // this.x+=this.sensX*(this.pas*this.turbo);
        // this.y+=this.sensY*(this.pas*this.turbo);
        this.x+=this.sensX*(this.pas*time.turbo);
        this.y+=this.sensY*(this.pas*time.turbo);
        if(this.y-30+this.cote<0)this.y=-140+window.innerHeight-this.cote;
        if(this.y+140+this.cote>window.innerHeight &&this.animRef!='ff')this.y=0-this.cote+30;
        if(this.x<-50)this.x=window.innerWidth-50;
        if(this.x+50>window.innerWidth)this.x=-50;
        this.elm.style.top=this.y+'px';
        this.elm.style.left=this.x+'px';        
    }
    animation(){
        this.TO= setTimeout(() => {
         
            this.placeImg(this.cote*-anim.seq[this.animCpt]+this.color,anim.ref[this.animRef]);
            this.animCpt++;
            if(this.animCpt>=4)this.animCpt=0;
            this.animation();
        }, this.animRate);
    }
    ai(){ // "circulation aléatoire de canard"
        if(this.animRef!='tt'&&this.animRef!='ff'&&this.animRef!='fa'){
            this.aiCpt++;
            if(this.aiCpt>150){ 
                this.sensX=posiNegaZeroDemi();
                this.sensY=posiNegaZeroDemi();
                this.aiCpt=rand(140);
if(this.sensX==1 || this.sensX==0.5 ){
    switch (this.sensY){
        case 0:
        case 0.5:
        case -0.5:
            this.animRef='dd';
        break;
        case -1:
        case -0.5:
            this.animRef='hd';
        break;
        case 1:
            this.animRef='bd';
        break;
    }
}
if(this.sensX==-1 || this.sensX==-0.5){
    switch (this.sensY){
        case 0:
        case 0.5:
        case -0.5:
            this.animRef='gg';
        break;
        case -1:
        case -0.5:
            this.animRef='hg';
        break;
        case 1:
            this.animRef='bg';
        break;
    }
}
if(this.sensX==0){
    switch (this.sensY){
        case 0:
        case 0.5:
        case -0.5:
            this.animRef='dd';
        break;
        case -1:
        case -0.5:
            this.animRef='hh';
        break;
        case 1:
            this.animRef='bb';
        break;
    }
}

            }
        }
    }

    scrollX(xx){
            this.x-=xx;
            document.querySelector('#'+this.id).style.left=this.x+'px';
            if(this.x<-237)this.x=window.innerWidth;
    }
    flyLoop(){
        if(this.flyAwayCpt<8){
        setTimeout(() => {
            this.elm.style.backgroundPosition=`${-102*this.flyAwayCpt}px -1122px`;
            this.flyAwayCpt++;
            this.flyLoop()
        }, 200);
    }else{
        setTimeout(() => {
            if(game.mode==1){
                     
    
    
                
            }
    
            if(game.mode==2){
            afficheMessage("out")
            if(game.viesChasseur==0){afficheMessage(-126);gameOverSeq();}
            else{afficheMessage(0);snd(bgm)
                
                setTimeout(() => {
                    afficheMessage("out");
                    controlOnOff(1);
                      launchDuck0()
                }, 1500);
              };
        }}, 2000);
    }
    }

    flyAway(){
        game.flewAway=1;
        game.tirOn=0;
        this.flyAwayCpt=0;
        canard.pause();
        timeBar('stop');
        controlOnOff(0);
        this.sensX=0;
        this.sensY=0;
        game.viesChasseur--;
        
        afficheMessage(-252)
this.animRef="fa";
bgm.pause();
snd(fly);
clearTimeout(this.TO);

this.flyLoop();

if(game.mode==1){clearTimeout(gameTO)}

}


}

function seqIn(){
 if(game.mode==2){   
            controlOnOff(1);
        }
        if(game.mode==1){
        }
}

function launchDuck(x){ // lancement d'une salve de canards
game.vivants=1+x;
if(time.turbo<1.5)time.turbo+=0.05;
game.chienIn=0;
afficheMessage(0);
scrollDecors(1);
dogAnim(1)

setTimeout(() => {
    dogAnim(0)
    scrollDecors(0);
    afficheMessage('out');
    timeBar('go');
    for(let i =0; i<=x; i++){
        let dck=spritesMap.get('duck'+i);
        ducksTab.push('duck'+i);
        dck.aiCpt=100;
        dck.init(rand(1000),window.innerHeight-250,0,0)
        
        document.body.querySelector(`#duck${i}`).onclick=function(){ //canard touché ?
           
            if(game.tirOn==1){
                dck=spritesMap.get(this.id);
                dck.touche();
                if(time.pos<=324){
                    time.pos+=18;
                    timeRouge.style.left=time.pos+"px";
                }
            }
        }   
    }
}, 2000);


    
};

//// init jeu globale

function startGame(jeu){

flush();

    run.pause();
    scrollDecors(0);
    dogAnim(0);
    document.body.style.cursor="none";
    document.querySelector('#cible').style.visibility='visible';
    document.querySelector('#titleContainer').style.visibility="hidden";

    game.mode=jeu;
    scroll.active=0;
    document.querySelector("#decors").style.left="0px";
    nuage1.init(window.innerWidth-400,50,5,5);
    nuage2.init(window.innerWidth-250,150,5,5);
    setTimeout(() => {
       game.tirOn=1; 
    }, 1000);
    
    loopCible();
    snd(bgm);
    bgm.loop=true;

    jeu==1?game1():game2();
}

////////////////////////////////////////  BOUCLE  jeu 2 joueurs
function launchDuck0(){

    if(game.viesCanard==0){
        gameOverSeq(-63);
    }
    else{
        game.flewAway=0;
        game.tirOn=1;
        duck=spritesMap.get("duck0");
        afficheMessage(0);
        setTimeout(() => {
            afficheMessage("out");
            controlOnOff(1);
            duck.init(rand(window.innerWidth),window.innerHeight/2,0,0);
            duck.pas=8;
            duck.animRef="hd";
            ducksTab.push('duck0');
            timeBar('in');
            timeBar('go');
            document.querySelector('#duck0').onclick=function(){
                if(duck.animRef!="ff"&&duck.animRef!="tt" && game.tirOn==1){ 
                    controlOnOff(0);
                    duck.touche();        
                }
         }
    }, 1700);
}
}

function game2(){
   timeBar('in');
    launchDuck0()

         seqIn();
    function boucleJeu2(){
        
        duck.bouge();
        nuage1.scrollX(0.3);
        nuage2.scrollX(0.1);
        gameTO=setTimeout(() => {
           
            boucleJeu2()
        }, 16);
}
boucleJeu2();
}

/////////////////////////////////////////  BOUCLE  J E U   1  joueur
function game1(){
    controlOnOff(1)////////////////////// à retirer
timeBar('in');
    launchDuck(game.population);
    

    function boucleJeu1(){
        for(let o of ducksTab ){
            spritesMap.get(o).bouge();//fait avancer les canards
            spritesMap.get(o).ai();//définit trajectoire des canards
            }   
        nuage1.scrollX(0.3);//scroll des nuages
        nuage2.scrollX(0.1);
        gameTO=setTimeout(() => {
            boucleJeu1()
        }, 16);
    }
boucleJeu1();
}

//creation des objets canards et 2 nuages
nuage1=new Sprite("nuage",1,237);
nuage2=new Sprite("nuage",2,237);
for(let i =0; i<30; i++)new Sprite("duck",i,102);
///////////////////////////////////// cible :

createChild("c",'cible',"32px","32px",'spritesContainer')

    window['c'].style.zIndex="2500";
    window['c'].style.visibility="hidden";


let cibleOP=0;
function loopCible(){
    cibleOP++==0?document.querySelector('#cible').style.backgroundPosition= "0px 0px" : document.querySelector('#cible').style.backgroundPosition= "-33px 0px";
    if(cibleOP==2)cibleOP=0;
   cibleTO=setTimeout(() => {
    loopCible();
   }, 50);
}

onmousemove=function(evnt){
    mouse.x=evnt.clientX;
    mouse.y=evnt.clientY;
    window['cible'].style.left=(evnt.clientX-16)+"px";
    window['cible'].style.top=(evnt.clientY-16)+"px";
}

function tirCible1(){
    clearTimeout(cibleTO);
    document.querySelector('#cible').style.backgroundPosition= "-66px 0px";
    snd(shoot);
    setTimeout(() => {
            loopCible();
    }, 60);

}

function tirCible2(){
    game.tirOn=0;
    clearTimeout(cibleTO);
    document.querySelector('#cible').style.backgroundPosition= "-66px 0px";
    snd(shoot);
    
    setTimeout(() => {
        document.querySelector('#cible').style.backgroundPosition= "-99px 0px";
        game.tirOn=0;
        setTimeout(() => {
            snd(select);
            game.tirOn=1;
            loopCible();
        }, 1000);
    }, 60);
}
/////////////////////////////////////  C O N T R O L E S

function killMove(sens, val){
    if(duck[sens]==val)duck[sens]=0;
    if(duck.sensX)duck.sensX==1?updateMove("sensX",1,'dd'):updateMove("sensX",-1,'gg')
    if(duck.sensY)duck.sensY==1?updateMove("sensY",1,'bb'):updateMove("sensY",-1,'hh')
    if(!duck.sensY&&!duck.sensX)duck.animRef=="dd"||duck.animRef=="hd"||duck.animRef=="bd"?updateMove("sensY",0,'hd'):updateMove("sensY",0,'hg')
}

function updateMove(sens, val, anim){
    duck[sens]=val;
    duck.animRef=anim;
}

function onKeyDown(){
    switch(event.code){
        case "ArrowUp":
            if(duck.sensX)duck.sensX==1? updateMove("sensY",-1,'hd'):updateMove("sensY",-1,'hg');
            else updateMove("sensY",-1,'hh')
            break;
        case 'ArrowDown':
            if(duck.sensX)duck.sensX==1? updateMove("sensY",1,'bd'):updateMove("sensY",1,'bg');
            else updateMove("sensY",1,'bb')
            break;
        case 'ArrowRight':
            updateMove("sensX",1,'dd')
            break;
        case 'ArrowLeft':
            updateMove("sensX",-1,'gg')
            break;
        case 'Space':
           
        //    spritesMap.get('duck0').flyAway();
        // launchDuck(10)
                // duckTurbo(1);
                // time.turbo=10;
        break
    } 
}

function onKeyUp(){
    switch(event.code){
        case "ArrowUp":
                killMove("sensY",-1);
            break;
        case 'ArrowDown':
                killMove("sensY",1);
            break;
        case 'ArrowRight':
                killMove("sensX",1);
            break;
        case 'ArrowLeft':
                killMove("sensX",-1);
            break;
        case 'Space':
            // duckTurbo(0);
            // time.turbo=1;
        break
    }
}

function duckTurbo(x){
    duck.turbo=1;
    duck.animRate=90;
    if(x){
        duck.turbo=2;
        duck.animRate=45;
    }
}

function controlOnOff(x){
if(x){
    addEventListener("keyup", onKeyUp);
    addEventListener("keydown", onKeyDown);
}else{
    removeEventListener("keyup", onKeyUp);
    removeEventListener("keydown", onKeyDown);
}
}

function titreLaunch(){
             document.querySelector("#nuage1").style.visibility="hidden";
    document.querySelector("#nuage2").style.visibility="hidden";
    game.population=2;
    game.viesChasseur=3;
    game.viesCanard=3;
    game.flewAway=0;
    time.turbo=1;
    game.chienIn=0;
    afficheMessage("out");
///////////////////////////////////// canards de l'intro :
for(let i =0; i<4; i++){
    let dck= spritesMap.get('duck'+i);
    dck.init(duckTitre[i][0],duckTitre[i][1],0,0);
    dck.color=0;
    dck.animCpt=rand(3);
    ducksTab.push('duck'+i);
    i==0?dck.animRef="dd":dck.animRef="ii";
    if(i==0)dck.animRate=50;
}
document.querySelector('#decors').style.visibility='visible';
document.querySelector('#fond').style.visibility='visible';
document.querySelector('#titleContainer').style.visibility='visible';
dogAnim(1);
scrollDecors(1);
snd(run);
}
// 
onclick=function(){
    if(game.tirOn==1)game.mode==1?tirCible1():tirCible2();
 }
//écran de démarrage / invinte au clique : 
creerContainer('logo',document.body,'100%','100%')

    document.querySelector('#logo').style.backgroundImage=`url('./img/logo.png')`;
    document.querySelector('#logo').style.backgroundColor='rgb(50,50,50)'
    document.querySelector('#logo').style.backgroundPosition=-205+window.innerWidth/2+'px '+ (-250+window.innerHeight/2)+'px';
    document.querySelector('#logo').style.backgroundRepeat='no-repeat';

document.querySelector('#logo').onclick=function(){
    
    document.body.removeChild(this);
    titreLaunch();
}

function flush(){
    if(game.mode){
        timeBar('stop');
        timeBar('out')
        clearTimeout(gameTO);
        clearTimeout(cibleTO);
        document.querySelector('#cible').style.visibility='hidden';
        document.body.style.cursor="default";
    }
        if(ducksTab.length>0){
            for(let i=0; i<ducksTab.length;i++){
                let duck = spritesMap.get(ducksTab[i]);
                clearTimeout(duck.TO);
                duck.elm.style.visibility='hidden'; 
            }
         ducksTab=[];
        }
    }

 