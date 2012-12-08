///////////////////////
// Events Controller //
///////////////////////

var EventsController = function()
{
	this.textData = '';
	this.jsonObject = null;
	this.objectUpdated = false;
	this.onChange = null;
	this.lastUpdateWasSuccessful = false;
};

EventsController.prototype.setData = function(text)
{
	if (this.textData === text)
		return;

	this.textData = text;
	var json = null;
	try
	{
		json = JSON.parse(this.textData);
	}
	catch(e)
	{
		json = null;
		console.log('-Data changed but not updated. Given text is not a correct JSON.');
	}

	var updatedResult = false;
	if (json !== null)
	{
		this.jsonObject = json;
		this.objectUpdated = true;
		updatedResult = true;
		if (!this.lastUpdateWasSuccessful)
		{
			console.log('+Data changed and updated successfully.');
		}
		if (this.onUpdated)
		{
			this.onUpdated(this.jsonObject);
		}
	}
	this.lastUpdateWasSuccessful = updatedResult;
};

EventsController.prototype.getData = function()
{
	return this.textData;
};

EventsController.prototype.getObject = function()
{
	return this.jsonObject;
};

EventsController.prototype.elementChanged = function(uuid, tags, content)
{
	if (this.onChange)
	{
		if (!uuid)
		{
			if (!content)
			{
				this.onChange({'action': 'frameClear'});
			}
			else
			{
				this.onChange({'action': 'frameLoad', 'content': content});
			}
		}
		else if (!tags && !content)
		{
			this.onChange({'action': 'starDestroy', 'uuid': uuid});
		}
		else if (!content)
		{
			this.onChange({'action': 'starTagsChange', 'uuid': uuid, 'tags': tags});
		}
		else if (!tags)
		{
			this.onChange({'action': 'starContentChange', 'uuid': uuid, 'content': content});
		}
		else
		{
			this.onChange({'action': 'starCreate', 'uuid': uuid, 'tags': tags, 'content': content});
		}
	}
};


////////////////////////////////////////////////////
// Frame Conception + Operational Transformations //
////////////////////////////////////////////////////

function FrameOT(frameHashId)
{
	var starField = {};
	this.errors = [];

	var otInstance = null;
	var frameName = 'frame:' + frameHashId;
	var eventsController = new EventsController();

	sharejs.open(
		frameName, 'text',
		function(error, frame)
		{
			if (error)
			{
				console.error(error);
				return;
			}
			frame.attach_events(eventsController);
			otInstance = frame;
		}
	);

	// Frame Functions

	var frameSave = function()
	{
		return JSON.stringify(starGetArray(), null, '\t');
	};

	var frameLoad = function(jsonContent)
	{
		var frameStarArray;
		try
		{
			frameStarArray = JSON.parse(jsonContent);
		}
		catch (e)
		{
			this.errors.push('Can not parse given content string as JSON. String: ' + jsonContent + '; Name: ' + e.name + '; Desc: ' + e.description);
			frameStarArray = [];
		}
		starLoadFromArray(frameStarArray);
	};

	var frameClear = function()
	{
		starField = {};
	};

	// Star Functions

	var starCreate = function()
	{
		var newStar = new StarElement();
		// TODO: check if newStar.id is unique
		starField[newStar.getId()] = newStar;
		return newStar;
	};

	var starLoad = function(givenId, givenTags, givenContent)
	{
		// TODO: check if givenId is unique
		starField[givenId] = new StarElement(givenId, givenTags, givenContent);
		return starField[givenId];
	};

	var starGetById = function(starId)
	{
		if (starId in starField)
			return starField[starId];
		else
			return null;
	};

	var starDestroy = function(starId)
	{
		if (starGetById(starId))
		{
			delete starField[starId];
		}
		else
		{
			this.errors.push(new Date() + ' > Can not destroy star by id: ' + starId);
		}
	};

	var starGetArray = function()
	{
		var result = [];
		for (var starId in starField)
		{
			var star = starField[starId];
			result.push(
				{
					id: star.getId(),
					tags: star.tags.getArray(),
					content: star.content
				}
			);
		}
		return result;
	};

	var starLoadFromArray = function(starArray)
	{
		frameClear();
		for (var i = 0; i < starArray.length; ++i)
		{
			var starDesc = starArray[i];
			starLoad(starDesc.id, starDesc.tags, starDesc.content);
		}
	};

	// Tags Functions

	var tagsIsValid = function(starId, tagId, maxIterations)
	{
		var star = starGetById(starId);
		if (!star)
		{
			this.errors.push(new Date() + ' > Frame has no star with id: ' + starId);
			return false;
		}

		var tagStar = starGetById(tagId);
		if (!tagStar)
		{
			this.errors.push(new Date() + ' > Frame has no star with id: ' + tagId);
			return false;
		}

		var starsToCheck = {};
		starsToCheck[tagStar.getId()] = tagStar;
		var iterationCount = 0;

		while (Object.keys(starsToCheck).length > 0)
		{
			var nextStarsToCheck = {};
			for (var starCheckId in starsToCheck)
			{
				if (starCheckId === starId)
					return false;
				var starCheck = starsToCheck[starCheckId];
				var tagsCheck = starCheck.tags.getArray();
				for (var i = 0; i < tagsCheck.length; ++i)
				{
					if (tagsCheck[i] === starId)
						return false;
					var nextStar = starGetById(tagsCheck[i]);
					if (nextStar)
					{
						nextStarsToCheck[nextStar.getId()] = nextStar;
					}
				}
			}
			starsToCheck = nextStarsToCheck;
			++iterationCount;
			if (maxIterations && iterationCount > maxIterations)
			{
				this.errors.push(new Date() + ' > Forced break. Probably frame has loops for stars: ' + starId + '; ' + tagId);
				break;
			}
		}
		return true;
	};

	var tagsAdd = function(starId, tagId)
	{
		if (tagsIsValid(starId, tagId))
		{
			starField[starId].tags.add(tagId);
		}
		else
		{
			this.errors.push(new Date() + ' > Tag ' + tagId + 'is not valid for star ' + starId);
		}
	};

	var tagsRemove = function(starId, tagId)
	{
		var star = starGetById(starId);
		if (!star)
		{
			this.errors.push(new Date() + ' > Frame has no star with id: ' + starId);
			return;
		}
		if (!star.tags.contains(tagId))
		{
			this.errors.push(new Date() + ' > Star ' + starId + ' has no tag: ' + tagId);
			return;
		}
		star.tags.remove(tagId);
	};

	var tagsContains = function(starId, tagId)
	{
		var star = starGetById(starId);
		if (!star)
		{
			this.errors.push(new Date() + ' > Frame has no star with id: ' + starId);
			return;
		}
		return star.tags.contains(tagId);
	};

	var tagsGetArray = function(starId)
	{
		var star = starGetById(starId);
		if (!star)
		{
			this.errors.push(new Date() + ' > Frame has no star with id: ' + starId);
			return null;
		}
		return star.tags.getArray();
	};

	var tagsClear = function(starId)
	{
		var star = starGetById(starId);
		if (!star)
		{
			this.errors.push(new Date() + ' > Frame has no star with id: ' + starId);
			return;
		}
		star.tags.clear();
	};

	sharejs.extendDoc(
		"attach_events",
		function(eventsController)
		{
			var doc = this;
			if (!doc.provides['text'])
			{
				throw new Error('Only text documents can be attached to ace');
			}
			var suppress = false;
			eventsController.onChange = eventsControllerListener;
			eventsController.onUpdated = externalUpdateListener;
			eventsController.setData(doc.getText());
			check();

			doc.on(
				'insert',
				function(pos, text)
				{
					suppress = true;
					eventsController.setData(doc.getText()); // TODO: optimize it and use pos, text
					suppress = false;
					return check();
				}
			);

			doc.on(
				'delete',
				function(pos, text)
				{
					suppress = true;
					eventsController.setData(doc.getText()); // TODO: optimize it and use pos, text
					suppress = false;
					return check();
				}
			);

			function check()
			{
				return window.setTimeout(
					function()
					{
						var editorText, otText;
						editorText = eventsController.getData();
						otText = doc.getText();
						if (editorText !== otText)
						{
							console.error("Text does not match!");
							console.error("editor: " + editorText);
							return console.error("ot:     " + otText);
						}
					},
					0
				);
			}

			function eventsControllerListener(change)
			{
				if (suppress)
					return;
				applyToShareJS(eventsController, change, doc);
				return check();
			}

			function externalUpdateListener(updatedJsonObject)
			{
				//var currentJsonObject = starGetArray();
				// TODO: compare 2 json objects and modify current to satisfy updated

				// stub
				starLoadFromArray(updatedJsonObject);
				// callback to refresh UI on chages
				if (eventsController.onVisualChanged)
				{
					eventsController.onVisualChanged();
				}
			}

			doc.detach_ace = function()
			{
				eventsController.onChange = null;
				eventsController.onUpdated = null;
				return delete doc.detach_ace;
			};

			function applyToShareJS(eventsController, change, doc)
			{
				switch (change.action)
				{
					case 'frameClear':
						// apply changes for local data representation
						frameClear();
						// actualize data in cache
						var emptyData = frameSave();
						eventsController.setData(emptyData);
						// apply changes for OT subsystem
						doc.del(0, doc.getText().length);
						doc.insert(0, emptyData);
						break;
					case 'frameLoad':
						// apply changes for local data representation
						frameLoad(change.content);
						// actualize data in cache
						var loadedData = frameSave();
						eventsController.setData(loadedData);
						// apply changes for OT subsystem
						doc.del(0, doc.getText().length);
						doc.insert(0, loadedData);
						break;
					case 'starDestroy':
						// apply changes for local data representation
						starDestroy(change.uuid);
						// actualize data in cache
						// TODO: implement
						// apply changes for OT subsystem
						// TODO: implement code below
						/*
						if (text block with change.uuid found)
						{
							doc.del(text block start position, text block length);
						}
						*/
						break;
					case 'starTagsChange':
						// TODO: implement case
						// apply changes for local data representation
						// actualize data in cache
						// apply changes for OT subsystem
						break;
					case 'starContentChange':
						// TODO: implement case
						// apply changes for local data representation
						// actualize data in cache
						// apply changes for OT subsystem
						break;
					case 'starCreate':
						// apply changes for local data representation
						var newStar = starCreate();
						// actualize data in cache
						// TODO: implement
						// apply changes for OT subsystem
						// TODO: implement code below
						/*
						doc.insert(position after last object in the doc, text representation of newStar);
						*/
						break;
					default:
						throw new Error('unknown action: ' + change.action);
				}
			}
		}
	);

	// OT oriented functions

	var frameLoadOT = function(jsonContent)
	{
		eventsController.elementChanged(null, null, jsonContent);
	}

	var frameClearOT = function()
	{
		eventsController.elementChanged();
	}

	this.SetVisualChengesHandler = function(handler)
	{
		eventsController.onVisualChanged = handler;
	}

	// TODO: implement modifications with OT via ShareJS.Text, use new function in interface

	// Interface

	this.load = frameLoadOT;
	this.save = frameSave;
	this.clear = frameClearOT;

	this.Star = {};
	this.Star.create = starCreate;
	this.Star.load = starLoad;
	this.Star.destroy = starDestroy;
	this.Star.getById = starGetById; // HACK method. // TODO: replace by setContent/getContent
	this.Star.getArray = starGetArray;
	this.Star.fromArray = starLoadFromArray;

	this.Star.Tags = {};
	this.Star.Tags.isValid = tagsIsValid;
	this.Star.Tags.add = tagsAdd;
	this.Star.Tags.remove = tagsRemove;
	this.Star.Tags.contains = tagsContains;
	this.Star.Tags.getArray = tagsGetArray;
	this.Star.Tags.clear = tagsClear;
}