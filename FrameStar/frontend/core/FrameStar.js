//////////////
// Uuid Set //
//////////////

function UuidSet()
{
	var elements = {};

	this.add = function(uuid)
	{
		elements[uuid] = true;
	};

	this.contains = function(uuid)
	{
		return (uuid in elements);
	};

	this.remove = function(uuid)
	{
		if (this.contains(uuid))
		{
			delete elements[uuid];
		}
	};

	this.clear = function()
	{
		elements = {};
	};

	this.getArray = function()
	{
		var result = [];
		for (var element in elements)
		{
			result.push(element);
		}
		return result;
	};
}

/////////////////////
// Star Conception //
/////////////////////

function GetNewId()
{
	function b(a) {return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}
	return b();
}

function StarElement(forceId, forceTags, forceContent)
{
	var id = forceId || GetNewId();
	this.tags = forceTags || new UuidSet();
	this.content = forceContent || null;

	this.getId = function()
	{
		return id;
	};
}

//////////////////////
// Frame Conception //
//////////////////////

function Frame()
{
	var starField = {};
	this.errors = [];

	// Frame Functions

	var frameSave = function(url)
	{
		// TODO: implement
	};

	var frameLoad = function(url)
	{
		// TODO: implement
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
	}

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

	// Interface

	this.load = frameLoad;
	this.save = frameSave;
	this.clear = frameClear;

	this.Star = {};
	this.Star.create = starCreate;
	this.Star.load = starLoad;
	this.Star.destroy = starDestroy;
	this.Star.getById = starGetById; // HACK method. // TODO: replace by setContent/getContent
	this.Star.getArray = starGetArray;

	this.Star.Tags = {};
	this.Star.Tags.isValid = tagsIsValid;
	this.Star.Tags.add = tagsAdd;
	this.Star.Tags.remove = tagsRemove;
	this.Star.Tags.contains = tagsContains;
	this.Star.Tags.getArray = tagsGetArray;
	this.Star.Tags.clear = tagsClear;
}