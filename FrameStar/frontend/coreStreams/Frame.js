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

	/* Description:
	//
	// Version 4 UUIDs as defined in the RFC 4122 specification. More info here:
	//   http://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_.28random.29
	// More safisticated implementations:
	//   https://github.com/LiosK/UUID.js
	//   http://www.broofa.com/2008/09/javascript-uuid-function/
	/////////////////////////////////////////////////////////////////////////////////////*/
}

/////////////////////
// Node Conception //
/////////////////////

function Node(initId, initTags, initContent)
{
	this.id = initId || new Uuid().generate();
	this.tags = initTags|| {};
	this.content = initContent || null;

	/* Description:
	//
	// * id - unique identifier of node object in UUID v4 format
	// * tags - set of pairs <link nodeId>:<type_of_link nodeId>
	// * content - link to arbitary information that this node contanes
	///////////////////////////////////////////////////////////////////
	// Example:
	//
	// node:
	// {
	//   id: '876baa28-1cb2-44c3-add8-17baa7cd2652',
	//   tags:
	//   {
	//     29cb7b44-0e43-41f8-aedf-f67deff8ff39: 'e6898f75-a09d-4e66-952e-12ef0c0c9a4b',
	//     6fbc1e1d-e401-49d1-8021-af35c5e6be33: 'e6898f75-a09d-4e66-952e-12ef0c0c9a4b'
	//     c67ef986-e57f-4b7d-ac98-4845543483e9: '585d5bad-8e79-45f6-8429-ebd765dec61e',
	//   },
	//   content: 'main node'
	// }
	//
	// where '29cb7b44...', '6fbc1e1d...', 'c67ef986...',
	// 'e6898f75...', '585d5bad...' are valid nodes
	///////////////////////////////////////////////////////////////////////////////////*/
}

//////////////////////
// Frame Conception //
//////////////////////

function Frame(initNodes)
{
	this.nodes = initNodes || [];

	/* Description:
	// * nodes - 1d array of nodes described in 'function Node'.
	///////////////////////////////////////////////////////////*/
}

//////////////////////////
// Frame Implementation //
//////////////////////////

function FrameAnalizer(initFrame)
{
	var frame = initFrame;

	var iterate = function(processNode)
	{
		var nodesClone = frame.nodes.slice(0);
		for (var i = 0; i < nodesClone.length; ++i)
		{
			processNode(nodesClone[i]);
		}
	};

	var stringify = function(compact)
	{
		return JSON.stringify(frame, null, compact ? null : '\t');
	};

	this.iterateNodes = iterate;
	this.stringifyNodes = stringify;

	/* Description:
	//
	// Analizer provides read-only access to entire frame.
	// It allows to analize whole structure of the frame and make decision.
	// * iterateNodes - makes copy of current frame and iterates thru it with
	// given function - to analize structure from outside.
	// * stringifyNodes - returns JSON representation of the frame structure.
	*/
}

function FrameContextControl(initFrame)
{
	var frame = initFrame;

	var getNodesById = function (nodeId)
	{
		var result = [];

		for (var i = 0; i < frame.nodes.length; ++i)
		{
			if (frame.nodes[i].id === nodeId)
			{
				result.push(frame.nodes[i]);
			}
		}
		return result.length > 0 ? new NodeControl(result) : null;
	};

	var addNewNode = function (newNode)
	{
		frame.nodes.push(newNode);
	};

	var removeNodesById = function (nodeId)
	{
		for (var i = frame.nodes.length; i >= 0; --i)
		{
			if (frame.nodes[i].id === nodeId)
			{
				frame.nodes.splice(i, 1);
			}
		}
	};

	var swapTwoNodes = function (node01, node02)
	{
		if (node01 === node02)
			return true;
		if (
			node01 < 0 || node02 < 0 ||
			node01 >= frame.nodes.length || node02 >= frame.nodes.length
		)
			return false;

		var index01 = -1;
		var index02 = -1;
		for (var i = frame.nodes.length; i >= 0; --i)
		{
			if (frame.nodes[i] === node01)
			{
				index01 = i;
			}
			if (frame.nodes[i] === node02)
			{
				index02 = i;
			}
			if (index01 >= 0 && index02 >= 0)
			{
				var bufferNode = frame.nodes[index02];
				frame.nodes[index02] = frame.nodes[index01];
				frame.nodes[index01] = bufferNode;
				return true;
			}
		}
		return false;
	};

	this.getNodeControls = getNodesById;
	this.addNode = addNewNode;
	this.removeNode = removeNodesById;
	this.swapNodePair = swapTwoNodes;

	/* Description:
	//
	// Context controller provides modification of the frame based on information
	// about some part of the structure. It is not necessary to know entire frame
	// to modify its structure. It is a context based approach.
	// * getNodeControl - get array of node controllers by id. It usually
	// contains 1 controller, but if there are >1 records with given id in the
	// frame, it will contain several controllers.
	// * addNode - add new node record to the frame.
	// * removeNode - remove all node records with given id from the frame.
	// * swapNodePair - swap 2 given elements of array to control order of
	// content merging. Variants of implementetion (have no decision yet):
	// (nodes with indices 5, 7 and 101 have the same id).
	// 1. content = content_5 + content_7 + content_101.
	// 2. content = [content_5, content_7, content_101].
	// 3. content = content_5.
	// 4. content = content_101.
	//
	// Explanation:
	//
	// Why one node id can corresponds to several nodes (node records)?
	// 1. We can implement Frame <-> Text synchronization without anoying checks
	// for uniqueness for every add/modify operation.
	// 2. We can prepare union of 2 different nodes by setting them the same id.
	// 3. We can prepare separation of node 01 to several other nodes by dividing
	// node 01 to several records with old id.
	// In points 2 and 3 we can easily (with minimal changes in text or object
	// structure) make union and separation for any nodes.
	////////////////////////////////////////////////////////////////////////////*/
}

function NodeControl(initNodeSequence)
{
	var nodeSequence = initNodeSequence;

	// TODO: figure out how to work with node sequence content.
	// WARNING: Current implementation is a stub!

	var getNodesContent = function()
	{
		// STUB implementation
		nodeSequence[0].content;
	};

	var setNodesContent = function(newContent)
	{
		// STUB implementation
		for (var i = 0; i < nodeSequence.length; ++i)
		{
			nodeSequence[i].content = newContent;
		}
	};

	var getNodesTagsControl = function()
	{
		// TODO: figure out how to control tags of several nodes via single controller.
		;
	};

	this.getTagsControl = getNodesTagsControl;
	this.getContent = getNodesContent;
	this.setContent = setNodesContent;

	/* Description: // TODO: write it.
	//
	// * getTagsControl - ...
	// * getContent - ...
	// * setContent - ...
	*/
}

// TODO: design and implement
/*
function TagsControl(initTags)
{
	var tags = initTags;

	this.clearTags = ;
	this.setLink = ;
	this.removeLink = ;
	this.containsLink = ;

	this.getLinkType = ;
	this.setLinkType = ;
}
*/