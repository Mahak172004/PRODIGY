let[seconds,minutes,hours]=[0,0,0];
let display=document.getElementById("display");
let interval=null;
let running=false;

document.getElementById("startStop").addEventListener("click",()=>{
    if(!running){
        interval=setInterval(updateTime,1000);
document.getElementById("startStop").textContent="Pause";
running=true;
    }else{
        clearInterval(interval);
document.getElementById("startStop").textContent="Start";
running=false;
    }
});

document.getElementById("reset").addEventListener("click",()=>{
    clearInterval(interval);
    [seconds,minutes,hours]=[0,0,0];
    display.textContent="00:00:00";
document.getElementById("startStop").textContent="Start";
running=false;
document.getElementById("laps").innerHTML="";
});

document.getElementById("laps").addEventListener("click",()=>{
    if(running){
        const lapTime=display.textContent;
        const li=document.createElement("li");
        li.textContent=`Lap: ${lapTime}`;
document.getElementById("laps").appendChild(li);
    }
});

function updateTime(){
    seconds++;
    if(seconds==60){
        seconds=0;
        minutes++;
        if(minutes==60){
            minutes=0;
            hours++;
        }
    }

    let h=hours<10 ? "0" + hours : hours;
    let m=hours<10 ? "0" + minutes : minutes;
    let s=hours<10 ? "0" + seconds : seconds;

    display.textContent=`${h}:${m}:${s}`;
}