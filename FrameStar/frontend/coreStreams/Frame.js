/////////////////////
// Uuid Conception //
/////////////////////

function Uuid()
{
	var c = function()
	{
		return 0;
	};
	function b(a) {return a?(a^c()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}
	this.empty = b();

	c = function()
	{
		return Math.random();
	};
	this.generate = b;
}

/////////////////////
// Atom Conception //
/////////////////////

function Atom(initTags, initContent)
{
	this.tags = initTags|| {};
	this.content = initContent || null;
}

/////////////////////
// Node Conception //
/////////////////////

function Node(initAtoms)
{
	this.atoms = initAtoms || [];
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

	var getFrameNodeControl = function(nodeId)
	{
		if (nodeId in frame.nodes)
			return new NodeControl(nodeId, frame.nodes[nodeId]);
		return null;
	};

	var getFrameNodesMatrix = function()
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
	this.getNodeControl = getFrameNodeControl;

	this.getMatrix = getFrameNodesMatrix;

	this.stringify = stringifyFrame;
}

/////////////////////////
// Node Implementation //
/////////////////////////

function NodeControl(nodeId, initNode)
{
	var id = nodeId;
	var node = initNode;

	var getNodeId = function()
	{
		return id;
	};

	var addNodeAtom = function(initAtom)
	{
		node.atoms.push(initAtom || new Atom());
		return node.atoms.length - 1;
	};

	var removeNodeAtom = function(atomIndex)
	{
		if (atomIndex < 0 || atomIndex >= node.atoms.length)
			return false;
		//node.atoms.splice(atomIndex, 1);
        node.atoms[atomIndex] = null;
		return true;
	};

	var clearNodeAtoms = function()
	{
		node.atoms = [];
	};

	var getNodeAtomControl = function(atomIndex)
	{
		if (atomIndex < 0 || atomIndex >= node.atoms.length)
			return null;
		return new AtomControl(node.atoms[atomIndex]);
	};

	var getNodeAtomsCount = function()
	{
		return node.atoms.length;
	};

	var getNodeTagsMatrix = function(includeTypes)
	{
		var result = {};
		var atomresults = [];
		for (var i = 0; i < node.atoms.length; ++i)
		{
			var control = new TagsControl(node.atoms[i]);
			atomresults.push(control.getMatrix(includeTypes));
		}
		for (var j = 0; j < atomresults.length; j++)
		{
			for (var tagLink in atomresults[j])
			{
				if (includeTypes)
				{
					if (!(tagLink in result))
					{
						result[tagLink] = {};
					}
					for (var tagType in atomresults[j][tagLink])
					{
						result[tagLink][tagType] = true;
					}
				}
				else
				{
					result[tagLink] = true;
				}
			}
		}
		return result;
	};

	this.getId = getNodeId;
	this.add = addNodeAtom;
	this.remove = removeNodeAtom;
	this.clear = clearNodeAtoms;
	this.getAtomControl = getNodeAtomControl;

	this.getAtomsCount = getNodeAtomsCount;
	this.getMatrix = getNodeTagsMatrix;
}

/////////////////////////
// Atom Implementation //
/////////////////////////

function AtomControl(initAtom)
{
	var atom = initAtom;

	var getAtomContent = function()
	{
		return atom.content;
	};

	var setAtomContent = function(newContent)
	{
		atom.content = newContent;
	};

	var getAtomTagsControl = function()
	{
		return new TagsControl(atom);
	};

	this.getContent = getAtomContent;
	this.setContent = setAtomContent;
	this.getTagsControl = getAtomTagsControl;
}

/////////////////////////
// Tags Implementation //
/////////////////////////

function TagsControl(initAtom)
{
	var atom = initAtom;

	var addTag = function(tagId)
	{
		if (tagId in atom.tags)
			return;
		atom.tags[tagId] = {};
	};

	var removeTag = function(tagId)
	{
		if (tagId in atom.tags)
		{
			delete atom.tags[tagId];
			return true;
		}
		return false;
	};

	var clearTags = function()
	{
		atom.tags = {};
	};

	var getTagControl = function(tagId)
	{
		if (tagId in atom.tags)
			return new TagControl(atom.tags, tagId);
		return null;
	};

	var getTagsMatrix = function(includeTypes)
	{
		var result = {};
		for (var tagLink in atom.tags)
		{
			var tagElement = true;
			if (includeTypes)
			{
				var control = new TagControl(atom.tags, tagLink);
				tagElement = control.getMatrix();
			}
			result[tagLink] = tagElement;
		}
		return result;
	};

	this.add = addTag;
	this.remove = removeTag;
	this.clear = clearTags;
	this.getControl = getTagControl;

	this.getMatrix = getTagsMatrix;
}

////////////////////////
// Tag Implementation //
////////////////////////

function TagControl(initTags, initTagId)
{
	var tags = initTags;
	var tagId = initTagId;

	var addType = function(typeId)
	{
		if (typeId in tags[tagId])
			return;
		tags[tagId][typeId] = true;
	};

	var removeType = function(typeId)
	{
		if (typeId in tags[tagId])
		{
			delete tags[tagId][typeId];
			return true;
		}
		return false;
	};

	var clearTypes = function()
	{
		tags[tagId] = {};
	};

	var getTagTypesMatrix = function()
	{
		var result = {};
		for (var tagType in tags[tagId])
		{
			result[tagType] = true;
		}
		return result;
	};

	this.add = addType;
	this.remove = removeType;
	this.clear = clearTypes;

	this.getMatrix = getTagTypesMatrix;
}

/////////////////////////////////
// Frame Filter Implementation //
/////////////////////////////////

// TODO: implement.