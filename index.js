
const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');

const appListJSON = "appList.json";
const appFolder = "apps";
const runFileChannelName = "run-file";
const containerID = "mainArea";

populateWithApps();

function populateWithApps() {
	traverseAppDir();
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

function addAppTitle(box, title) {
	var element = document.createElement("h2");
	var spanElement = document.createElement("span");
	element.className = "appTitle";
	spanElement.textContent = title;
	element.appendChild(spanElement);
	box.appendChild(element);
	return element;
}

function traverseAppDir() {
	var pathDir = path.join(__dirname, appFolder);	
	var area = document.getElementById(containerID);
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
						getAppInfo(currFilePath, area);
					}
				});
			});
		}
	});
}

function getAppInfo(pathDir, area) {	
	var element = createBox(area);
	fs.readdir(pathDir, function(err, files) {
		files.forEach(function(file, index) {
			var currFilePath = path.join(pathDir, file);
			fs.stat(currFilePath, function(err, stat) {
				if(stat.isFile()) {
					getFileInfo(currFilePath, element, file);
				}
			});
		});
	});
}

function getFileInfo(currFilePath, element, filename) {
	var filetype = path.extname(currFilePath);
	if(filetype === ".jpg"){
		imgPath = currFilePath.replace(/\\/g,"/").replace(/\(/g,"\\\(").replace(/\)/g,"\\\)").replace(/ /g, "%20");
		imgPath = "url(".concat(imgPath,")");
		element.style.backgroundImage = imgPath;
		console.log(imgPath);
		element.style.backgroundColor = "red";
	}
	else if(filetype === ".exe") {
		console.log(currFilePath);
		addListener(element, currFilePath);
		var appTitle = filename.slice(0, -4);
		addAppTitle(element, appTitle);
	}
}

function addListener(element, filepath) {
	element.addEventListener('click', function() {
		ipcRenderer.send(runFileChannelName, filepath);
	});	
}