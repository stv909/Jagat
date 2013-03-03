/////////////////////
// Node Conception //
/////////////////////

	/* Description:
	//
	// * atoms - array of node atoms.
	//           TODO: think about array -> dictionary {id: atom} if array construction will make pain.
	//
	// Node = Atom01 + Atom02 + ... + Atom0N,
	// where Node id === Atom0i id,
	//       Node tags === union of Atom0i.tags,
	//       Node content === [Atom01.content, Atom02.content, ..., Atom0N.content];
	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Example:
	//
	// node:
	// {
	//   atoms:
	//   [
	//     {
	//       tags:
	//       {
	//         af35c5e6-0e43-41f8-aedf-f67deff8ff39: {},
	//         29cb7b44-0e43-41f8-aedf-f67deff8ff39: {}
	//       },
	//       content: 'main node'
	//     },
	//     {
	//       tags:
	//       {
	//         29cb7b44-0e43-41f8-aedf-f67deff8ff39: {e6898f75-a09d-4e66-952e-12ef0c0c9a4b: true},
	//         6fbc1e1d-e401-49d1-8021-af35c5e6be33: {e6898f75-a09d-4e66-952e-12ef0c0c9a4b: true,
	//                                                585d5bad-8e79-45f6-8429-ebd765dec61e: true},
	//         c67ef986-e57f-4b7d-ac98-4845543483e9: {585d5bad-8e79-45f6-8429-ebd765dec61e: true,
	//                                                e6898f75-a09d-4e66-952e-12ef0c0c9a4b: true}
	//       },
	//       content: 'additional info'
	//     }
	//   ]
	// }
	//
	// where 'af35c5e6', '29cb7b44...', '6fbc1e1d...', 'c67ef986...',
	//       'e6898f75...', '585d5bad...' are other valid nodes;
	/////////////////////////////////////////////////////////////////////////////////////////*/

/////////////////////////
// Node Implementation //
/////////////////////////

	/* Description:
	//
	// * getTags - get list of node ids that assigned as tags (link nodes)
	//             for current node.
	// * getTagsControl - get controller for tags of current node.
	// * getContent - get content array for current node.
	// * setContent - set content array for current node.
	/////////////////////////////////////////////////////////////////////*/
