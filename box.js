var Box = function (width) {
	this.width = width;
};

Box.prototype.log = function() {
	console.log("box with width: " + this.width);
};

exports.Box = Box;

