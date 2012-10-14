// THREEx.MouseState extension	
var THREEx = THREEx || {}; // TODO: uncomment it after placing in separated module file
THREEx.MouseState = function()
{
	// to store the current state
	this.buttonDowns = {};
	this.buttonDownCount = 0;
	this.modifiers = {};
	this.position = {x: 0.0, y: 0.0};
	
	// create callback to bind/unbind mouse events
	var self = this;
	this._onMouseDown = function(event) 
	{ 
		self._onMouseButonChange(event, true); 
	};
	this._onMouseUp = function(event) 
	{ 
		self._onMouseButonChange(event, false); 
	};
	this._onMouseMove = function(event)
	{
		self.position.x = ( event.clientX / window.innerWidth ) * 2.0 - 1.0;
		self.position.y = - ( event.clientY / window.innerHeight ) * 2.0 + 1.0;
	}
	
	// bind mouseEvents
	document.addEventListener('mousedown', this._onMouseDown, false);
	document.addEventListener('mouseup', this._onMouseUp, false);
	document.addEventListener('mousemove', this._onMouseMove, false);
}

THREEx.MouseState.prototype.destroy	= function()
{
	// unbind mouseEvents
	document.removeEventListener('mousedown', this._onMouseDown, false);
	document.removeEventListener('mouseup', this._onMouseUp, false);
	document.removeEventListener('mousemove', this._onMouseMove, false);
}

THREEx.MouseState.MODIFIERS	= ['shift', 'ctrl', 'alt', 'meta'];
THREEx.MouseState.ALIAS	= {
	'lmb'		: 0,
	'mmb'		: 1,
	'rmb'		: 2
};

THREEx.MouseState.prototype._onMouseButonChange	= function(event, pressed)
{
	// log to debug
	//console.log("onMouseButonChange", event, pressed, event.button, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)

	// init this.buttonsDown for current button
	if (Object.keys(this.buttonDowns).indexOf(event.button) == -1)
	{
		this.buttonDowns[event.button] = 0;
	}
	
	// update this.buttonsDown
	if (pressed)
	{
		++this.buttonDowns[event.button];
		++this.buttonDownCount;
	}
	else
	{
		--this.buttonDowns[event.button];
		--this.buttonDownCount;
	}

	// update this.modifiers
	this.modifiers['shift'] = event.shiftKey;
	this.modifiers['ctrl'] = event.ctrlKey;
	this.modifiers['alt'] = event.altKey;
	this.modifiers['meta'] = event.metaKey;
}

THREEx.MouseState.prototype.pressed = function(buttonDesc)
{
	if (this.buttonDownCount == 0)
		return false;
	var buttons = buttonDesc.split("+");
	for(var i = 0; i < buttons.length; i++)
	{
		var button = buttons[i];
		var pressed;
		if (THREEx.MouseState.MODIFIERS.indexOf(button) !== -1)
		{
			pressed	= this.modifiers[button];
		}
		else if (Object.keys(THREEx.MouseState.ALIAS).indexOf(button) != -1)
		{
			pressed	= this.buttonDowns[THREEx.MouseState.ALIAS[button]] > 0;
		}
		else 
		{
			pressed	= this.buttonDowns[button]
		}
		if (!pressed)
			return false;
	};
	return true;
}
