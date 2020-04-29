
var exec = require('child_process').exec;

var player="omxplayer";
if (process.platform == 'win32') player="cmdmp3.exe";

function puts (error, stdout, stderr) { 
	console.log(stdout); 
} 

var sound = {

	playSound: function (name,random_options=0){
		if (random_options > 0) {
		  selection = Math.round(Math.random()*random_options);
		  if (selection==0) selection=1;
		  soundfile_name="./wav/"+name+String(selection)+".wav";
		} else soundfile_name="./wav/"+name+".wav";

		console.log ("play sound:"+player+" " + soundfile_name);
		playerProcess=exec(player+" "+soundfile_name); // , puts);
		console.log("playerProcess pid="+playerProcess.pid);
	}, 
    stopAllSounds: function () {
		if (player=="cmdmp3.exe") 
		    killcmd="taskkill /im cmdmp3.exe /f";
		else killcmd="killall omxplayer.bin";
		console.log ("stop all ongoing sounds:"+killcmd);
		exec(killcmd);
	}
}

module.exports = sound;
