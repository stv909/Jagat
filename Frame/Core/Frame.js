/////////////////////
// Uuid Conception //
/////////////////////

function Uuid()
{
	var c = function() { return 0 };
	function b(a) { return a?(a^c()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b) }
	this.empty = b();

	c = function() { return Math.random() };
	this.generate = b;
}

////////////////////
// Tag Conception //
////////////////////

function Tag(initTagTypes)
{
	this.types = initTagTypes|| {};
}

/////////////////////
// Node Conception //
/////////////////////

function Node(initTags, initContent)
{
	this.tags = initTags|| {};
	this.content = initContent || null;
}

//////////////////////
// Frame Conception //
//////////////////////

function Frame(initNodes)
{
	this.nodes = initNodes || {};
}

//////////////////////////
// Frame Implementation //
//////////////////////////

function FrameControl(initFrame)
{
	var frame = initFrame;

	var addNode = function(initId)
	{
		var nodeId = initId || (new Uuid()).generate();
		if (!(nodeId in frame.nodes))
		{
			frame.nodes[nodeId] = new Node();
		}
		return nodeId;
	};

	var removeNode = function(nodeId)
	{
		if (nodeId in frame.nodes)
		{
			delete frame.nodes[nodeId];
			return true;
		}
		return false;
	};

	var clearNodes = function()
	{
		frame.nodes = {};
	};

	var getNodeControl = function(nodeId)
	{
		if (nodeId in frame.nodes)
			return new NodeControl(nodeId, frame.nodes[nodeId]);
		return null;
	};

	var getNodesMatrix = function()
	{
		var result = {};
		for (var nodeId in frame.nodes)
		{
			result[nodeId] = true;
		}
		return result;
	};

	var stringifyFrame = function(compact)
	{
		return JSON.stringify(frame, null, compact ? null : '\t');
	};

	this.add = addNode;
	this.remove = removeNode;
	this.clear = clearNodes;

	this.getElement = getNodeControl;
	this.getMatrix = getFrameNodesMatrix;
	this.getFrameCode = stringifyFrame;
}

/////////////////////////
// Node Implementation //
/////////////////////////

function NodeControl(nodeId, initNode)
{
	var id = nodeId;
	var node = initNode;

	var addTagLink = function(tagId)
	{
		if (tagId in node.tags)
			return;
		node.tags[tagId] = new Tag();
	};

	var removeTagLink = function(tagId)
	{
		if (tagId in node.tags)
		{
			delete node.tags[tagId];
			return true;
		}
		return false;
	};

	var clearTagLinks = function()
	{
		node.tags = {};
	};

	var getTagLinkControl = function(tagId)
	{
		if (tagId in node.tags)
			return new TagControl(tagId, node.tags[tagId]);
		return null;
	};

	var getNodeContent = function()
	{
		return node.content;
	};

	var setNodeContent = function(newContent)
	{
		node.content = newContent;
	};

	var getNodeId = function()
	{
		return id;
	};

	var getNodeTagsMatrix = function()
	{
		var result = {};
		for (var tagLink in node.tags)
		{
			result[tagLink] = true;
		}
		return result;
	};

	this.add = addTagLink;
	this.remove = removeTagLink;
	this.clear = clearTagLinks;

	this.getContent = getNodeContent;
	this.setContent = setNodeContent;

	this.getId = getNodeId;
	this.getElement = getTagLinkControl;
	this.getMatrix = getNodeTagsMatrix;
}

////////////////////////
// Tag Implementation //
////////////////////////

function TagControl(tagId, initTag)
{
	var id = tagId;
	var tag = initTag;

	var addTagType = function(typeId)
	{
		if (typeId in tag.types)
			return;
		tag.types[typeId] = true;
	};

	var removeTagType = function(typeId)
	{
		if (typeId in tag.types)
		{
			delete tag.types[typeId];
			return true;
		}
		return false;
	};

	var clearTagTypes = function()
	{
		tag.types = {};
	};

	var getTagId = function()
	{
		return id;
	}

	var getTagTypesMatrix = function()
	{
		var result = {};
		for (var tagType in tag.types)
		{
			result[tagType] = true;
		}
		return result;
	};

	this.add = addTagType;
	this.remove = removeTagType;
	this.clear = clearTagTypes;

	this.getId = getTagId;
	this.getMatrix = getTagTypesMatrix;
}