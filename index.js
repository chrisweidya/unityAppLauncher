
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



function populateWithApps() {
	traverseAppDir();
	var list = getAppList();
	populate(list["apps"]);
	console.log(list["directory"]);
}

function getAppList() {
	var obj = JSON.parse(fs.readFileSync(appListJSON, 'utf8'));
	return obj;
}

function populate(apps) {
	var area = document.getElementById("mainArea");
	apps.forEach(function(app) {
		var element = createBox(area);			
		addListener(element, path.join(__dirname, appFolder, app["filename"]));
		});	
}

function createImage(element, path) {
	element.style.backgroundImage="url(path)";
}

function createBox(area) {
	var element = document.createElement("div");
	element.className = "box";
	area.appendChild(element);
	return element;
}

function traverseAppDir() {
	var pathDir = path.join(__dirname, appFolder);
	fs.readdir(pathDir, function(err, files) {
		if(err) {
			console.error("No such app directory.");
		}
		else {
			files.forEach(function(file, index) {
				var currFilePath = path.join(pathDir, file);
				fs.stat(currFilePath, function(err, stat) {
					if(err) {
						console.error("No such file or directory.");
					}
					if(stat.isDirectory()) {
						getAppInfo(currFilePath);
					}
				});
			});
		}
	});
}

function getAppInfo(pathDir) {
	fs.readdir(pathDir, function(err, files) {
		files.forEach(function(file, index) {
			var currFilePath = path.join(pathDir, file);
			fs.stat(currFilePath, function(err, stat) {
				if(stat.isFile()) {
					getFileInfo(currFilePath);
				}
			});
		});
	});
}

function getFileInfo(currFilePath) {
	var filetype = path.extname(currFilePath);
	if(filetype === ".jpg"){
		console.log("works");
	}
}

function addListener(element, path) {
	element.addEventListener('click', function() {
		ipcRenderer.send(runFileChannelName, path);
	});	
}