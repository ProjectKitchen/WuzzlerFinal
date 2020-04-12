
var exec = require('child_process').exec;



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

		console.log ("play sound " + soundfile_name);
		omxplayer=exec("omxplayer "+soundfile_name); // , puts);
		console.log("omxplayer pid="+omxplayer.pid);
	}, 
    stopAllSounds: function () {
		cmd="killall omxplayer.bin";
		console.log ("stopped all ongoing sounds");
		exec(cmd);
	}
}

module.exports = sound;
