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
	// id - unique identifier of node object in UUID v4 format
	// tags - set of pairs <link nodeId>:<type_of_link nodeId>
	// content - link to arbitary information that this node contanes
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

function Frame(initStructure)
{
	;

	/*
	*/
}