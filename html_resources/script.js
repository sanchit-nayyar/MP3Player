song_container = document.getElementById('sName');
playlist = document.getElementById('playlist');
player = document.getElementById('player');
player_source = document.createElement('source');
loadedPreviously = false;
path_prefix = '';
historyPane = document.getElementById('history');
songsPanel = document.getElementById('nav');
repeatStatus = 0;
rpBox = document.getElementById('repeatBox');

playlist_contents = new Array();
playlist_store = new Array();
timeouts = new Array();


getRand = function(a, b){	//Random Number: a included b excluded
	var step = b - a;
	var num = Math.random();
	num *= step;
	num += a;
	return parseInt(num);
}

remainingSeconds = function(){
	return parseFloat(player.duration - player.currentTime);
}

startChecks = function(){
	timeouts.push(setTimeout(function(){
			if(remainingSeconds() < 1){
				nextSong();
			}
			startChecks();
		}, 1000));
}

forceSong = function(sName){
	playlist_contents = playlist_store.slice();
	historyPane.innerHTML = '';
	playSong(path_prefix + sName);
}

populateNav = function(){
	var navData = '';
	var first = true;
	playlist_contents.forEach(function(x){
		if(!first)
			navData += '<button onclick="forceSong(\'' + x + '\');">' + x + '</button><br>';
		first = false;
	});
	songsPanel.innerHTML = navData;
}

$('#playlist').change(function(){
	if(!('files' in playlist) || playlist.files.length == 0){
		alert('Upload the playlist file to start playback');
	}else{
		playlist_data = playlist.files[0];
		if(playlist_data){
			playlist_reader = new FileReader();
			playlist_reader.readAsText(playlist_data);
			playlist_reader.onload = function(e){
				for(var i = 0; i < timeouts.length; ++i){
					clearTimeout(timeouts[0]);
					timeouts.splice(0, 1);
				}
				playlist_contents = (e.target.result).split('\n');
				playlist_contents.splice(playlist_contents.length - 1, 1);				//Remove Last Element (Empty Line)
				playlist_store = playlist_contents.slice();
				nextSong();
				startChecks();
				populateNav();
			}
		}
	}
});

playSong = function(sPath){
	if(!loadedPreviously){
		player_source.src = sPath;
		player_source.id = 'playerSource';
		player.appendChild(player_source);
		loadedPreviously = true;
		player.play()
		player_source = document.getElementById('playerSource');
	}else{
		player_source.src = sPath;
		player.load();
		player.play();
	}
	var sName = sPath.split('/').slice(-1);
	song_container.innerHTML = sName;
	historyPane.innerHTML = sName + '<br>' + historyPane.innerHTML;
}

nextSong = function(){
	if (repeatStatus == 1){
		player.play();
		return;
	}
	var nSongs = playlist_contents.length - 1;
	if(nSongs == 0 && repeatStatus == 0){
		playlist_contents = playlist_store.slice();
		nSongs = playlist_contents.length - 1;
	}
	path_prefix = playlist_contents[0];
	var sCode = getRand(1, nSongs);
	var sPath = path_prefix + playlist_contents[sCode];
	playSong(sPath);
	playlist_contents.splice(sCode, 1);
}

prevSong = function(){
	histList = historyPane.innerHTML.split('<br>');
	prevName = histList[1];
	histList.splice(0, 1)
	playSong(path_prefix + prevName);
	playlist_contents.push(prevName);
	historyPane.innerHTML = histList.join('<br>');
}

switchRepeat = function(){
	repeatStatus++;
	if(repeatStatus == 3) repeatStatus = 0;
	if(repeatStatus == 0){
		rpBox.innerHTML = 'Repeat: ALL';
	}
	if(repeatStatus == 1){
		rpBox.innerHTML = 'Repeat: ONE';
	}
	if(repeatStatus == 2){
		rpBox.innerHTML = 'Repeat: NONE';
	}
}