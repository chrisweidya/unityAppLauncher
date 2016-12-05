const {app, BrowserWindow, ipcMain, shell} = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function initialize() {
	createWindow();
	createBoxes();
	subscribeEvents();
}

function subscribeEvents() {
	ipcMain.on('run-file', function(event, arg) {
		console.log(arg);
		shell.openExternal(arg);
	});
}

function createBoxes() {
	var Box = require('./box.js').Box;
	var box = new Box(40);
	box.log();
}


function createWindow() {
	// creates window
	win = new BrowserWindow({
		width: 1920, 
		height: 600,
		resizable: false
		});
	// disables menu
	win.setMenu(null);
	win.setFullScreen(true);
	// and load the index.html of the app.
	win.loadURL(url.format({
		pathname:path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));
	// console mode
//	win.webContents.openDevTools();
	// dereferences window when closed
	win.on('closed', () => {
		win = null;
	});
	
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initialize);
	
// On macOS it is common for applications and their menu bar
// to stay active until the user quits explicitly with Cmd + Q
app.on('window-all-closed', () => {
	if(process.platform !== 'darwin') {
		app.quit();
	};
});

// On macOS it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on('activate', () => {
	if(win === null) {
		createWindow();
	};
});