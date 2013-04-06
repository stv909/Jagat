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

/////////////////////
// Link Conception //
/////////////////////

function Link(initAspects)
{
	this.aspects = initAspects|| {};
}

/////////////////////
// Node Conception //
/////////////////////

function Node(initLinks, initContent)
{
	this.links = initLinks|| {};
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
	this.getMatrix = getNodesMatrix;
	this.getFrameCode = stringifyFrame;
}

/////////////////////////
// Node Implementation //
/////////////////////////

function NodeControl(initId, initNode)
{
	var id = initId;
	var node = initNode;

	var addLink = function(linkId)
	{
		if (linkId in node.links)
			return;
		node.links[linkId] = new Link();
	};

	var removeLink = function(linkId)
	{
		if (linkId in node.links)
		{
			delete node.links[linkId];
			return true;
		}
		return false;
	};

	var clearLinks = function()
	{
		node.links = {};
	};

	var getLinkControl = function(linkId)
	{
		if (linkId in node.links)
			return new LinkControl(linkId, node.links[linkId]);
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

	var getNodeLinksMatrix = function()
	{
		var result = {};
		for (var linkId in node.links)
		{
			result[linkId] = true;
		}
		return result;
	};

	this.add = addLink;
	this.remove = removeLink;
	this.clear = clearLinks;

	this.getContent = getNodeContent;
	this.setContent = setNodeContent;

	this.getId = getNodeId;
	this.getElement = getLinkControl;
	this.getMatrix = getNodeLinksMatrix;
}

/////////////////////////
// Link Implementation //
/////////////////////////

function LinkControl(initId, initLink)
{
	var id = initId;
	var link = initLink;

	var addLinkAspect = function(aspectId)
	{
		if (aspectId in link.aspects)
			return;
		link.aspects[aspectId] = true;
	};

	var removeLinkAspect = function(aspectId)
	{
		if (aspectId in link.aspects)
		{
			delete link.aspects[aspectId];
			return true;
		}
		return false;
	};

	var clearLinkAspects = function()
	{
		link.aspects = {};
	};

	var getLinkId = function()
	{
		return id;
	};

	var getLinkAspectsMatrix = function()
	{
		var result = {};
		for (var aspectId in link.aspects)
		{
			result[aspectId] = true;
		}
		return result;
	};

	this.add = addLinkAspect;
	this.remove = removeLinkAspect;
	this.clear = clearLinkAspects;

	this.getId = getLinkId;
	this.getMatrix = getLinkAspectsMatrix;
}