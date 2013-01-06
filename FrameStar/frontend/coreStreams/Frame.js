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

// TODO: update all coments below

/////////////////////
// Atom Conception //
/////////////////////

function Atom(initId, initTags, initContent)
{
	this.id = initId || new Uuid().generate();
	this.tags = initTags|| {};
	this.content = initContent || null;

	/* Description:
	//
	// * id - unique identifier of the Node in UUID v4 format
	// * tags - set of pairs <link nodeId>: [<type_of_link nodeId 01>, <type_of_link nodeId 01>, ...]
	// * content - link to arbitary information that this node atom contanes
	/////////////////////////////////////////////////////////////////////////////////////////////////
	// Example:
	//
	// atom:
	// {
	//   id: '876baa28-1cb2-44c3-add8-17baa7cd2652',
	//   tags:
	//   {
	//     af35c5e6-0e43-41f8-aedf-f67deff8ff39: [],
	//     29cb7b44-0e43-41f8-aedf-f67deff8ff39: ['e6898f75-a09d-4e66-952e-12ef0c0c9a4b'],
	//     6fbc1e1d-e401-49d1-8021-af35c5e6be33: ['e6898f75-a09d-4e66-952e-12ef0c0c9a4b', '585d5bad-8e79-45f6-8429-ebd765dec61e'],
	//     c67ef986-e57f-4b7d-ac98-4845543483e9: ['585d5bad-8e79-45f6-8429-ebd765dec61e']
	//   },
	//   content: 'main node'
	// }
	//
	// where 'af35c5e6', '29cb7b44...', '6fbc1e1d...', 'c67ef986...',
	//       'e6898f75...', '585d5bad...' are valid nodes;
	// [] - common type for basic tag links.
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
}

/////////////////////
// Node Conception //
/////////////////////

/* Description:
//
// Node = Atom01 + Atom02 + ... + Atom0N,
// where Node.id === Atom0i.id, Node.tags === union of Atom0i.tags,
//       Node.content === [Atom01.content, Atom02.content, ..., Atom0N.content] // TODO: think about better conception.
*/

/////////////////////////
// Node Implementation //
/////////////////////////

function NodeControl(initAtoms)
{
	var nodeAtoms = initAtoms;

	var getNodeContent = function()
	{
		var result = [];
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			result.push(nodeAtoms[i].content);
		}
		return result;
	};

	var setNodeContent = function(newContent)
	{
		for (var i = 0; i < newContent.length && i < nodeAtoms.length; ++i)
		{
			if (newContent[i] === undefined)
				continue;
			nodeAtoms[i].content = newContent[i];
		}
	};

	var getNodeTagsAnalizer = function()
	{
		return new TagsAnalizer(nodeAtoms);
	};

	var getNodeTagsControl = function()
	{
		return new TagsControl(nodeAtoms);
	};

	this.getTagsAnalizer = getNodeTagsAnalizer;
	this.getTagsControl = getNodeTagsControl;
	this.getContent = getNodeContent;
	this.setContent = setNodeContent;

	/* Description: // TODO: write it.
	//
	// * getTagsAnalizer - ...
	// * getTagsControl - ...
	// * getContent - ...
	// * setContent - ...
	*/
}

function TagsAnalizer(initAtoms)
{
	var nodeAtoms = initAtoms;

	var iterateTags = function(processTag)
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			for (var tagClone in nodeAtoms[i].tags)
			{
				processTag(tagClone);
			}
		}
	};

	this.iterate = iterateTags;
}

function TagsControl(initAtoms)
{
	var nodeAtoms = initAtoms;

	var clearTags = function()
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			nodeAtoms[i].tags = {};
		}
	};

	var addTag = function(linkNodeId)
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			if (linkNodeId in nodeAtoms[i].tags)
				return;
		}
		// TODO: decide somehow in what atom should be tag link added
		// STUB: add tag to 0-th atom only
		nodeAtoms[0].tags[linkNodeId] = [];
	};

	var removeTag = function(linkNodeId)
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			if (linkNodeId in nodeAtoms[i].tags)
			{
				delete nodeAtoms[i].tags[linkNodeId];
			}
		}
	};

	var getNodeTagTypesAnalizer = function(linkNodeId)
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			if (linkNodeId in nodeAtoms[i].tags)
				return new TagTypesAnalizer(nodeAtoms, linkNodeId);
		}
		return null;
	};

	var getNodeTagTypesControl = function(linkNodeId)
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			if (linkNodeId in nodeAtoms[i].tags)
				return new TagTypesControl(nodeAtoms, linkNodeId);
		}
		return null;
	};

	this.clear = clearTags;
	this.add = addTag;
	this.remove = removeTag;
	this.getTagTypesAnalizer = getNodeTagTypesAnalizer;
	this.getTagTypesControl = getNodeTagTypesControl;
}

function TagTypesAnalizer(initAtoms, initLinkNodeId)
{
	var nodeAtoms = initAtoms;
	var linkId = initLinkNodeId;

	var iterateTagTypes = function(processTagType)
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			if (linkId in nodeAtoms[i].tags)
			{
				var tagTypesClone = nodeAtoms[i].tags[linkId].slice(0);
				processTagType(tagTypesClone);
			}
		}
	};

	this.iterate = iterateTagTypes;
}

function TagTypesControl(initAtoms, initLinkNodeId)
{
	var nodeAtoms = initAtoms;
	var linkId = initLinkNodeId;

	var clearTagTypes = function()
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			if (linkId in nodeAtoms[i].tags)
			{
				nodeAtoms[i].tags[linkId] = [];
			}
		}
	};

	var addTagType = function(typeNodeId)
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			// TODO: decide somehow in what atom should be tag link added
			// TODO: check if newTagType already exists
			// STUB: add tag type in the first atom with needed tag
			if (linkId in nodeAtoms[i].tags)
			{
				nodeAtoms[i].tags[linkId].push(typeNodeId);
				break;
			}
		}
	};

	var removeTagType = function(typeNodeId)
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			if (linkId in nodeAtoms[i].tags)
			{
				var tagTypes = nodeAtoms[i].tags[linkId];
				for (var j = tagTypes.length; j >= 0; --j)
				{
					if (tagTypes[j] === typeNodeId)
					{
						tagTypes.splice(j, 1);
					}
				}
			}
		}
	};

	this.clear = clearTagTypes;
	this.add = addTagType;
	this.remove = removeTagType;
}

//////////////////////
// Frame Conception //
//////////////////////

function Frame(initAtoms)
{
	this.atoms = initAtoms || [];

	/* Description:
	// * atoms - 1d array of node atoms described in 'function Atom'.
	////////////////////////////////////////////////////////////////*/
}

//////////////////////////
// Frame Implementation //
//////////////////////////

function FrameAnalizer(initFrame)
{
	var frame = initFrame;

	var iterateAtoms = function(processNode)
	{
		var atomsClone = frame.atoms.slice(0);
		for (var i = 0; i < atomsClone.length; ++i)
		{
			processNode(atomsClone[i]);
		}
	};

	var stringifyFrame = function(compact)
	{
		return JSON.stringify(frame, null, compact ? null : '\t');
	};

	this.iterate = iterateAtoms;
	this.stringify = stringifyFrame;

	/* Description:
	//
	// Analizer provides read-only access to entire frame.
	// It allows to analize whole structure of the frame and make decision.
	// * iterate - makes copy of current atoms and iterates thru them with
	// given function - to analize structure from outside.
	// * stringify - returns JSON representation of the frame structure.
	////////////////////////////////////////////////////////////////////////*/
}

function FrameContextControl(initFrame)
{
	var frame = initFrame;

	var addNodeAtom = function(newAtom)
	{
		frame.atoms.push(newAtom);
	};

	var removeNodeAtom = function(nodeId, atomIndex)
	{
		var currentIndex = 0;
		for (var i = 0; i < frame.atoms.length; ++i)
		{
			if (frame.atoms[i].id === nodeId)
			{
				if (atomIndex === currentIndex++)
				{
					frame.atoms.splice(i, 1);
					return true;
				}
			}
		}
		return false;
	};

	var swapNodeAtomPair = function (nodeId, atom01NodeIndex, atom02NodeIndex)
	{
		if (atom01FrameIndex === atom02FrameIndex)
			return true;
		var atom01FrameIndex = -1;
		var atom02FrameIndex = -1;
		var currentIndex = 0;

		for (var i = 0; i < frame.atoms.length; ++i)
		{
			if (frame.atoms[i].id === nodeId)
			{
				if (atom01NodeIndex === currentIndex)
				{
					atom01FrameIndex = i;
				}
				if (atom02NodeIndex === currentIndex)
				{
					atom02FrameIndex = i;
				}
				++currentIndex;
				if (atom01FrameIndex > -1 && atom02FrameIndex > -1)
				{
					var bufferNode = frame.atoms[atom02FrameIndex];
					frame.atoms[atom02FrameIndex] = frame.atoms[atom01FrameIndex];
					frame.atoms[atom01FrameIndex] = bufferNode;
				}
			}
		}
	};

	var getNodeById = function(nodeId)
	{
		var nodeAtoms = [];
		for (var i = 0; i < frame.atoms.length; ++i)
		{
			if (frame.atoms[i].id === nodeId)
			{
				nodeAtoms.push(frame.atoms[i]);
			}
		}
		return nodeAtoms.length > 0 ? new NodeControl(nodeAtoms) : null;
	};

	var removeNodeById = function (nodeId)
	{
		for (var i = frame.nodes.length; i >= 0; --i)
		{
			if (frame.nodes[i].id === nodeId)
			{
				frame.nodes.splice(i, 1);
			}
		}
	};

	this.addAtom = addNodeAtom;
	this.removeAtom = removeNodeAtom;
	this.swapAtomPair = swapNodeAtomPair;
	this.getNodeControl = getNodeById;
	this.removeNode = removeNodeById;

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