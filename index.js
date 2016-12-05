
const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');
const $ = require('jquery');

const appListJSON = "appList.json";
const appFolder = "apps";
const runFileChannelName = "run-file";
const containerID = "mainArea";

var Infobox = require('./infobox.js').Infobox;
var infoboxElement = new Infobox();
main();

function main() {
	populateWithApps();
	startDimmerListener();
}

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
	element.className = "box bg-stretch-no-repeat hoverhand";
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

function addDescription(box, description) {
	var element = document.createElement("div");
	element.className = "hidden description";	
	element.textContent = description;
	box.appendChild(element);
}

function addWarning(box, warning) {
	var element = document.createElement("div");
	element.className = "hidden warning";	
	element.textContent = warning;
	box.appendChild(element);
	console.log(warning);
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

function getFileInfo(currFilePath, box, filename) {
	console.log(filename);
	addListener(box);
	var filetype = path.extname(currFilePath);
	if(filetype === ".jpg"){
		imgPath = currFilePath.replace(/\\/g,"/").replace(/\(/g,"\\\(").replace(/\)/g,"\\\)").replace(/ /g, "%20");
		imgPath = "url(".concat(imgPath,")");
		box.style.backgroundImage = imgPath;
		box.imgURL = imgPath;
	}
	else if(filetype === ".exe") {
		var appTitle = filename.slice(0, -4);
		addAppTitle(box, appTitle);
		box.title = appTitle;
		box.filepath = currFilePath;
	}
	else if(filename === "Description.txt" || filename === "description.txt") {
		fs.readFile(currFilePath, 'utf-8', function (err, data) {
			if(err) {
				console.error("Error reading description file.");
			}
			box.description = data;
		});
	}
	else if(filename === "Warning.txt" || filename === "warning.txt") {
		fs.readFile(currFilePath, 'utf-8', function (err, data) {
			if(err) {
				console.error("Error reading warning file.");
			}
			box.warning = data;
		});
	}
}

function addListener(element) {
	element.addEventListener('click', function() {	
		changeInfoboxContent(element);
		infoboxElement.show();
	});	
}

function addInfoboxListener(element) {
	document.getElementById("infoboxImage").addEventListener('click', function() {		
		ipcRenderer.send(runFileChannelName, infoboxElement.filepath);
	});	
}

function changeInfoboxContent(box) {
	infoboxElement.targetpath = box.filepath;
	infoboxElement.changeTitle(box.title);
	infoboxElement.changeDescription(box.description);
	infoboxElement.changeImage(box.imgURL);
}

function startDimmerListener() {
	document.getElementById("infoboxDimmer").addEventListener('click', function() {		
		infoboxElement.hide();
	});	
	document.getElementById("infoboxImage").addEventListener('click', function() {		
		ipcRenderer.send(runFileChannelName, infoboxElement.targetpath);
	});	
}
	
