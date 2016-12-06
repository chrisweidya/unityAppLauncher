Infobox = function () {
	this.infoboxJq = $("#infobox");
	this.infoboxDimmerJq = $("#infoboxDimmer");
	this.infoboxTitle = document.getElementById("infoboxTitle");
	this.infoboxDescription = document.getElementById("infoboxDescription");
	this.infoboxWarning = document.getElementById('infoboxWarning');
	this.infoboxImage = document.getElementById('infoboxImage');
	this.isHidden = true;
}

Infobox.prototype.changeTitle = function(text) {
	if(text !== null)
		this.infoboxTitle.textContent = text;
}

Infobox.prototype.changeDescription = function(text) {
	if(text !== null)
		this.infoboxDescription.textContent = text;
}

Infobox.prototype.changeWarning = function(text) {
	if(text !== null)
		this.infoboxWarning.textContent = text;
}

Infobox.prototype.changeImage = function(url) {
	if(url !== null)
		this.infoboxImage.style.backgroundImage = url;
}

Infobox.prototype.hide = function() {
	
	if(!this.isHidden) {
		
	console.log("fsadffff");
		this.pushAside(this.infoboxJq);
		this.undim(this.infoboxDimmerJq);
		this.isHidden = true;
	}
}

Infobox.prototype.show = function() {
	if(this.isHidden) {
		this.center(this.infoboxJq);
		this.dim(this.infoboxDimmerJq);
		this.isHidden = false;
	}
}

Infobox.prototype.getElement = function() {
	return this.infobox;
}

Infobox.prototype.center = function(element) {
	element.css("position","absolute");
	var topAmt = Math.max(0, (($(window).height() - $(element).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px";
	var leftAmt = Math.max(0, (($(window).width() - $(element).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px";
	element.animate({
		"top": topAmt,
		"left": leftAmt
	});
    return element;
}

Infobox.prototype.undim = function(element) {
	
	element.animate({
		"opacity": "0"
	});
	element.promise().done(function(){
		element.css("visibility", "hidden");
	});
}

Infobox.prototype.pushAside = function(element) {
	var topAmt = "-500px";
	var leftAmt = Math.max(0, (($(window).width() - $(element).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px";
	element.animate({
		"top": topAmt,
		"left": leftAmt
	});
    return element;
}

Infobox.prototype.dim = function(element) {
	element.css("visibility", "visible");
	element.animate({
		"opacity": "0.8"
	});
}
	
exports.Infobox = Infobox;

