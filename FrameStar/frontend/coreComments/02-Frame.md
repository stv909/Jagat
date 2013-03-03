//////////////////////
// Frame Conception //
//////////////////////

	/* Description:
	// * nodes - dictionary of frame nodes: {id: node, id: node, ...}.
	//           id - unique identifier of the Node in UUID v4 format.
	/////////////////////////////////////////////////////////////////////////////////////
	// Example:
	//
	// frame:
	// {
	//   '876baa28-1cb2-44c3-add8-17baa7cd2652':
	//   {
	//     atoms:
	//     [
	//       {
	//         tags: {...},
	//         content: ...
	//       },
	//       {
	//         tags: {...},
	//         content: ...
	//       }
	//     ]
	//   },
	//   '945e8a96-67db-43f8-823a-5fdc1f75eb2c':
	//   {
	//     atoms:
	//     [
	//       {
	//         tags: {...},
	//         content: ...
	//       }
	//     ]
	//   }
	// }
	/////////////////////////////////////////////////////*/

//////////////////////////
// Frame Implementation //
//////////////////////////

	/* Description:
	//
	// Lister provides read-only access to features of entire frame.
	// It allows to analize whole structure of the frame nodes and make decision.
	// * getNodes - get dictionary of all frame's node ids.
	// * stringify - returns JSON representation of the frame structure.
	////////////////////////////////////////////////////////////////////////////*/

	/* Description:
	//
	// Filter provides read-only access to features of entire frame limited by
	// condition for presence or absence of nodes' links and types.
	// * filterNodes - get list of nodes with given tag defined by link and/or type nodes.
	/////////////////////////////////////////////////////////////////////////////////////*/

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
