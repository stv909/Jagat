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
	// * tags - set of pairs <link nodeId>: {<type_of_link nodeId 01>: true, <type_of_link nodeId 02>: true, ...}
	// * content - link to arbitary information that this node atom contanes
	// If (<type_of_link nodeId 0i>: false) then 0i link type is inactive.
	// TODO: think about implementation of tags by hash list.
	/////////////////////////////////////////////////////////////////////////////////////////////////
	// Example:
	//
	// atom:
	// {
	//   id: '876baa28-1cb2-44c3-add8-17baa7cd2652',
	//   tags:
	//   {
	//     af35c5e6-0e43-41f8-aedf-f67deff8ff39: {},
	//     29cb7b44-0e43-41f8-aedf-f67deff8ff39: {e6898f75-a09d-4e66-952e-12ef0c0c9a4b: true},
	//     6fbc1e1d-e401-49d1-8021-af35c5e6be33: {e6898f75-a09d-4e66-952e-12ef0c0c9a4b: true,
	//                                            585d5bad-8e79-45f6-8429-ebd765dec61e: true},
	//     c67ef986-e57f-4b7d-ac98-4845543483e9: {585d5bad-8e79-45f6-8429-ebd765dec61e: true,
	//                                            e6898f75-a09d-4e66-952e-12ef0c0c9a4b: false}
	//   },
	//   content: 'main node'
	// }
	//
	// where 'af35c5e6', '29cb7b44...', '6fbc1e1d...', 'c67ef986...',
	//       'e6898f75...', '585d5bad...' are valid nodes;
	// {} - common type for basic tag links.
	/////////////////////////////////////////////////////////////////////////////////////////*/
}

/////////////////////
// Node Conception //
/////////////////////

	/* Description:
	//
	// Node = Atom01 + Atom02 + ... + Atom0N,
	// where Node.id === Atom0i.id,
	//       Node.tags === union of Atom0i.tags,
	//       Node.content === [Atom01.content, Atom02.content, ..., Atom0N.content];
	// TODO: think about better conception of Node.content.
	///////////////////////////////////////////////////////////////////////////////*/

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

	var getNodeTagsList = function()
	{
		var result = {};
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			var nodeTags = nodeAtoms[i].tags;
			for (var tag in nodeTags)
			{
				result[tag] = true;
			}
		}
		return result;
	};

	var getNodeTagsControl = function()
	{
		return new TagsControl(nodeAtoms);
	};

	this.getTags = getNodeTagsList;
	this.getTagsControl = getNodeTagsControl;
	this.getContent = getNodeContent;
	this.setContent = setNodeContent;

	/* Description:
	//
	// * getTags - get list of node ids that assigned as tags (link nodes)
	//             for current node.
	// * getTagsControl - get controller for tags of current node.
	// * getContent - get content array for current node.
	// * setContent - set content array for current node.
	/////////////////////////////////////////////////////////////////////*/
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
				continue;
			nodeAtoms[i].tags[linkNodeId] = {};
		}
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

	var getNodeTagTypesList = function(linkNodeId)
	{
		var result = {};
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			if (linkNodeId in nodeAtoms[i].tags)
			{
				var tagTypes = nodeAtoms[i].tags[linkNodeId];
				for (var tagType in tagTypes)
				{
					if (tagType in result)
					{
						result[tagType] = result[tagType] || tagTypes[tagType];
					}
					else
					{
						result[tagType] = tagTypes[tagType];
					}
				}
			}
		}
		return result;
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
	this.getTagTypesList = getNodeTagTypesList;
	this.getTagTypesControl = getNodeTagTypesControl;

	/* Description:
	//
	// * clear - delete all assigned tags.
	// * add - add new tag - with default type.
	// * remove - remove specified tag.
	// * getTagTypesList - get list of types for specified tag.
	// * getTagTypesControl - get controller for specified tag.
	//////////////////////////////////////////////////////////*/
}

function TagTypesControl(initAtoms, initLinkNodeId)
{
	var nodeAtoms = initAtoms;
	var linkNodeId = initLinkNodeId;

	var clearTagTypes = function()
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			if (linkNodeId in nodeAtoms[i].tags)
			{
				nodeAtoms[i].tags[linkNodeId] = {};
			}
		}
	};

	var addTagType = function(typeNodeId)
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			if (linkNodeId in nodeAtoms[i].tags)
			{
				nodeAtoms[i].tags[linkNodeId][typeNodeId] = true;
			}
		}
	};

	var removeTagType = function(typeNodeId)
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			var atomTags = nodeAtoms[i].tags;
			if (
				linkNodeId in atomTags &&
				typeNodeId in atomTags[linkNodeId]
			)
			{
				delete atomTags[linkNodeId][typeNodeId];
			}
		}
	};

	var setActiveTagType = function(typeNodeId, isActive)
	{
		for (var i = 0; i < nodeAtoms.length; ++i)
		{
			var atomTags = nodeAtoms[i].tags;
			if (
				linkNodeId in atomTags &&
				typeNodeId in atomTags[linkNodeId]
			)
			{
				atomTags[linkNodeId][typeNodeId] = isActive;
			}
		}
	};

	this.clear = clearTagTypes;
	this.add = addTagType;
	this.remove = removeTagType;
	this.setActive = setActiveTagType;

	/* Description:
	// * clear - delete all link types assigned to tag.
	// * add - add new link type to tag.
	// * remove - remove specified link type to tag.
	// * setActive - activate/deactivate link type of tag.
	/////////////////////////////////////////////////////*/
}

//////////////////////
// Frame Conception //
//////////////////////

function Frame(initAtoms)
{
	this.atoms = initAtoms || [];

	/* Description:
	// * atoms - 1d array of node atoms described in Atom.
	/////////////////////////////////////////////////////*/
}

//////////////////////////
// Frame Implementation //
//////////////////////////

function FrameLister(initFrame)
{
	var frame = initFrame;

	var getFrameNodesList = function()
	{
		var result = {};
		for (var i = 0; i < frame.atoms.length; ++i)
		{
			result[frame.atoms[i].id] = true;
		}
		return result;
	};

	var stringifyFrame = function(compact)
	{
		return JSON.stringify(frame, null, compact ? null : '\t');
	};

	this.getNodes = getFrameNodesList;
	this.stringify = stringifyFrame;

	/* Description:
	//
	// Lister provides read-only access to features of entire frame.
	// It allows to analize whole structure of the frame nodes and make decision.
	// * getNodes - get dictionary of all frame's node ids.
	// * stringify - returns JSON representation of the frame structure.
	////////////////////////////////////////////////////////////////////////////*/
}

function FrameFilter(initFrame)
{
	var frame = initFrame;

	var getFrameNodesFilteredList = function(needsTagLinkNodeId, needsTagTypeNodeId)
	{
		var result = {};
		for (var i = 0; i < frame.atoms.length; ++i)
		{
			var atomFits = false;
			if (needsTagLinkNodeId)
			{
				if (needsTagLinkNodeId in frame.atoms[i].tags)
				{
					atomFits = !needsTagTypeNodeId ? true:
						(
							needsTagTypeNodeId in frame.atoms[i].tags[needsTagLinkNodeId] &&
							frame.atoms[i].tags[needsTagLinkNodeId][needsTagTypeNodeId]
						);
				}
			}
			else if (needsTagTypeNodeId)
			{
				for (var linkNodeId in frame.atoms[i].tags)
				{
					if (
						needsTagTypeNodeId in frame.atoms[i].tags[linkNodeId] &&
						frame.atoms[i].tags[linkNodeId][needsTagTypeNodeId]
					)
					{
						atomFits = true;
						break;
					}
				}
			}
			if (atomFits)
			{
				result[frame.atoms[i].id] = true;
			}
		}
		return result;
	};

	this.filterNodes = getFrameNodesFilteredList;

	/* Description:
	//
	// Filter provides read-only access to features of entire frame limited by
	// condition for presence or absence of nodes' links and types.
	// * filterNodes - get list of nodes with given tag defined by link and/or type nodes.
	/////////////////////////////////////////////////////////////////////////////////////*/
}

function FrameControl(initFrame)
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
					return true;
				}
			}
		}
		return false;
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
		for (var i = frame.atoms.length; i >= 0; --i)
		{
			if (frame.atoms[i].id === nodeId)
			{
				frame.atoms.splice(i, 1);
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
	// * addAtom - add constructed atom that could be a new node or a part of
	//             existing node - depending of assigned id.
	// * removeAtom - removes atom by node id and node atom index.
	// * swapAtomPair - swap 2 atoms of the same node defined by node indices.
	//             Useful for operating with content which is order dependent.
	//             Example: node consists of atoms with frame indices 5, 7, 101.
	//                      node.content = [content_5, content_7, content_101]
	// * getNodeControl - getnode controller for array of atoms found by node id.
	// * removeNode - remove all atoms of given node from the frame.
	//
	// Explanation:
	//
	// Why one node id can corresponds to several node atoms?
	// 1. We can implement Frame <-> Text synchronization without anoying checks
	// for uniqueness for every add/modify operation.
	// 2. We can prepare union of 2 different nodes by setting them the same id.
	// 3. We can prepare separation of node 01 to several other nodes by dividing
	// node 01 to several atoms with old id.
	// In points 2 and 3 we can easily (with minimal changes in text or object
	// structure) make union and separation for any nodes.
	////////////////////////////////////////////////////////////////////////////*/
}