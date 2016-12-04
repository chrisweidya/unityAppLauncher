
const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');

const appListJSON = "appList.json";
const appFolder = "apps";
const runFileChannelName = "run-file";

populateWithApps();

/*
var boxElement = document.getElementsByClassName('box');
boxElement[0].addEventListener('click', function() {
	ipcRenderer.send('run-file', 'lol');
});
*/


function getAppList() {
	var obj = JSON.parse(fs.readFileSync(appListJSON, 'utf8'));
	return obj;
}
function populateWithApps() {
	var list = getAppList();
	populate(list["apps"]);
	console.log(list["directory"]);
}
function populate(apps) {
	var area = document.getElementById("mainArea");
	apps.forEach(function(app) {
		var element = createBox(area);			
		addListener(element, path.join(__dirname, appFolder, app["filename"]));
		});	
}

function createBox(area) {
	var element = document.createElement("div");
	element.className = "box";
	area.appendChild(element);
	return element;
}

function addListener(element, path) {
	element.addEventListener('click', function() {
		ipcRenderer.send(runFileChannelName, path);
	});	
}