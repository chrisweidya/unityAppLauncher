//Requires
const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');
const $ = require('jquery');

//Constants for directory
const appListJSON = "appList.json";
const appFolder = "apps";
const runFileChannelName = "run-file";
const containerID = "mainArea";

//Initialization
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

//JSON parser, not used
function getAppList() {
	var obj = JSON.parse(fs.readFileSync(appListJSON, 'utf8'));
	return obj;
}
//Creates box icons for each app
function createBox(area) {
	var element = document.createElement("div");
	element.className = "box bg-stretch-no-repeat hoverhand";
	area.appendChild(element);
	return element;
}
//Creates app title and adds it as child element to box
function addAppTitle(box, title) {
	var element = document.createElement("h2");
	var spanElement = document.createElement("span");
	element.className = "appTitle";
	spanElement.textContent = title;
	element.appendChild(spanElement);
	box.appendChild(element);
	return element;
}
//Creates description div and adds it as child to box
function addDescription(box, description) {
	var element = document.createElement("div");
	element.className = "hidden description";	
	element.textContent = description;
	box.appendChild(element);
}
//Creates warning div and adds it as child to box
function addWarning(box, warning) {
	var element = document.createElement("div");
	element.className = "hidden warning";	
	element.textContent = warning;
	box.appendChild(element);
}
//Moves through app directory and gets key files in each folder. One folder, one app.
//Goes into each folder.
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
//Moves one level into folder and iterates through each file in folder
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
//Checks each file for a .jpg, .exe, description.txt and warning.txt
function getFileInfo(currFilePath, box, filename) {
	addListener(box);
	var filetype = path.extname(currFilePath);
	if(filetype === ".jpg" || filetype === ".png"){
		imgPath = currFilePath.replace(/\\/g,"/").replace(/\(/g,"\\\(").replace(/\)/g,"\\\)");
		imgPath = `url("${imgPath}")`;
		box.style.backgroundImage = imgPath;
		box.imgURL = imgPath;
	}
	else if(filetype === ".exe") {
		box.filepath = currFilePath;

		// Patch globalgamemanagers asset to make it run in fullscreen.
		const basename = path.basename(currFilePath, '.exe');
		const assetPath = path.join(path.dirname(currFilePath), `${basename}_Data/globalgamemanagers`);
		fs.readFile(assetPath, (err, data) => {
			if (err) {
				console.log(`${currFilePath} globalgamemanagers asset cannot be patched`);
			} else {
				const pattern = Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
				const patchOffset = data.indexOf(pattern) + 8 + 4;
				if (data.readUInt8(patchOffset) === 0x02) {
					console.log(`${currFilePath} already patched, ignoring`);
					return;
				}

				data.writeUInt8(0x02, patchOffset);
				fs.writeFile(assetPath, data, (err) => {
					if (err) {
						console.log(`${currFilePath} globalgamemanagers asset cannot be written`);
					} else {
						console.log(`${currFilePath} globalgamemanagers asset patched!`);
					}
				})
			}
		});
	}
	if(filename === "metadata.json") {
		const metadata = require(currFilePath);
		box.usingMetadataJson = true;
		box.title = metadata.title;
		box.description = metadata.description;
		box.warning = metadata.additionalWarnings;
		box.authors = metadata.authors;
		box.vrExperience = metadata.vrExperience;
		box.vrComfortRating = metadata.vrComfortRating;
		box.titleElem = addAppTitle(box, box.title);
	}
}
//Adds click listeners for boxes
function addListener(element) {
	element.addEventListener('click', function() {	
		changeInfoboxContent(element);
		infoboxElement.show();
	});	
}
//Adds click listener for infobox
function addInfoboxListener(element) {
	const infoboxStarting = document.getElementById('infoboxStarting');
	const infoboxTop = document.getElementById('infoboxTop');
	infoboxStarting.style.display = 'block';
	infoboxTop.style.display = 'none';
	setTimeout(() => {
		infoboxStarting.style.display = 'none';
		infoboxTop.style.display = 'flex';
		ipcRenderer.send(runFileChannelName, infoboxElement.filepath);
	}, 5000);
}
//Changes information box content depending on boxes clicked
function changeInfoboxContent(box) {
	infoboxElement.targetpath = box.filepath;
	infoboxElement.changeTitle(box.title);
	infoboxElement.changeDescription(box.description);
	infoboxElement.changeWarning(box.warning);
	infoboxElement.changeImage(box.imgURL);
	infoboxElement.changeAuthors(box.authors);
	infoboxElement.changeVrComfortRating(box.vrComfortRating);
}
//UI listener and filepath changer
function startDimmerListener() {
	document.getElementById("infoboxDimmer").addEventListener('click', function() {		
		infoboxElement.hide();
	});	
	document.getElementById("infoboxImage").addEventListener('click', function() {
		const infoboxStarting = document.getElementById('infoboxStarting');
		const infoboxTop = document.getElementById('infoboxTop');
		infoboxStarting.style.display = 'block';
		infoboxTop.style.display = 'none';
		setTimeout(() => {
			infoboxStarting.style.display = 'none';
			infoboxTop.style.display = 'flex';
			ipcRenderer.send(runFileChannelName, infoboxElement.targetpath);
			infoboxElement.hide();
		}, 5000);
	});	
}
	
