function runAllTests(output)
{
	function resetView()
	{
		output.innerHTML = '';
	}

	function pushResult(testFunctionName)
	{
		var testFunction = window[testFunctionName];
		var resultText = '[invalid test function object]';
		if (typeof testFunction === 'function')
		{
			resultText = testFunction();
		}

		var testParagraph = document.createElement('p');
		var testTitle = document.createTextNode(testFunctionName);
		var view = document.createElement('textarea');
		view.textContent = resultText;

		testParagraph.appendChild(testTitle);
		testParagraph.appendChild(document.createElement('br'));
		testParagraph.appendChild(view);
		output.appendChild(testParagraph);
	}

	function pushMessage(messageText)
	{
		var messageParagraph = output.appendChild(document.createElement('p'));
		messageParagraph.innerHTML = messageText;
		output.appendChild(messageParagraph);
	}

	resetView();

	// TODO: make function that search and runs all test functions in alphabetical order
	pushResult('p01GenerateUuids');
	pushResult('p02CreateVoidFrame');
	pushResult('p03CreateSimpleFrame');
	pushResult('p04CreateLinkedFrame');
	pushResult('p05CreateTypeLinkedFrame');
	pushResult('p06RemoveLinkTypesInFrame');
	pushResult('p07ClearLinkTypesInFrame');
	pushResult('p08RemoveTagsInFrame');
	pushResult('p09ClearTagsInFrame');
	pushResult('p10RemoveNodeAtomsInFrame');
	pushResult('p11ClearNodeAtomsFrame');
	pushResult('p12RemoveNodesInFrame');
	pushResult('p13ClearNodesInFrame');

	pushMessage('Test run complete!');
}

function p01GenerateUuids()
{
	var uuid = new Uuid();
	return uuid.empty + '\r\n' + uuid.generate() + '\r\n' +
		uuid.generate() + '\r\n' + uuid.generate();
}

function p02CreateVoidFrame()
{
	var frame = new Frame();
	var frameControl = new FrameControl(frame);

	var result =
		JSON.stringify(frame) + '\r\n' + '\r\n' +
		JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
		frameControl.stringify();
	return result;
}

function p03CreateSimpleFrame()
{
	var frame = new Frame();
	var frameControl = new FrameControl(frame);

	var nodeControl01 = frameControl.getNodeControl(frameControl.add());
	var nodeControl02 = frameControl.getNodeControl(frameControl.add());
	var nodeControl03 = frameControl.getNodeControl(frameControl.add());

	nodeControl01.add(new Atom(null, "01 node 01 atom"));
	nodeControl02.add(new Atom(null, "02 node 01 atom"));
	nodeControl02.add(new Atom(null, "02 node 02 atom"));
	nodeControl02.add(new Atom(null, "02 node 03 atom"));
	nodeControl03.add(new Atom(null, "03 node 01 atom"));
	nodeControl03.add(new Atom(null, "03 node 02 atom"));

	var result =
		JSON.stringify(frame) + '\r\n' + '\r\n' +
		JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
		frameControl.stringify();
	return result;
}

function p04CreateLinkedFrame()
{
	var frame = new Frame();
	var frameControl = new FrameControl(frame);

	var nodeControl01 = frameControl.getNodeControl(frameControl.add());
	var nodeControl02 = frameControl.getNodeControl(frameControl.add());
	var nodeControl03 = frameControl.getNodeControl(frameControl.add());

	var tagsControl11 = nodeControl01.getAtomControl(
		nodeControl01.add(new Atom(null, "01 node 01 atom"))
	).getTagsControl();
	var tagsControl21 = nodeControl02.getAtomControl(
		nodeControl02.add(new Atom(null, "02 node 01 atom"))
	).getTagsControl();
	var tagsControl22 = nodeControl02.getAtomControl(
		nodeControl02.add(new Atom(null, "02 node 02 atom"))
	).getTagsControl();
	var tagsControl23 = nodeControl02.getAtomControl(
		nodeControl02.add(new Atom(null, "02 node 03 atom"))
	).getTagsControl();
	var tagsControl31 = nodeControl03.getAtomControl(
		nodeControl03.add(new Atom(null, "03 node 01 atom"))
	).getTagsControl();
	var tagsControl32 = nodeControl03.getAtomControl(
		nodeControl03.add(new Atom(null, "03 node 02 atom"))
	).getTagsControl();

	tagsControl21.add(nodeControl01.getId());
	tagsControl21.add(nodeControl03.getId());
	tagsControl22.add(nodeControl01.getId());
	tagsControl23.add(nodeControl03.getId());
	tagsControl11.add(nodeControl03.getId());

	function GetLinkageMatrix(frameControl, includeTypes)
	{
		var result = '';
		var matrix = frameControl.getMatrix();
		for (var element in matrix)
		{
			var nodeControl = frameControl.getNodeControl(element);
			var linkageMatrix = nodeControl.getMatrix(includeTypes);
			result += nodeControl.getId() + ':   ' +
				JSON.stringify(linkageMatrix) + '\r\n';
		}
		return result;
	}

	var result =
		JSON.stringify(frame) + '\r\n' + '\r\n' +
		JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
		GetLinkageMatrix(frameControl, false) + '\r\n' +
		GetLinkageMatrix(frameControl, true) + '\r\n' +
		frameControl.stringify();
	return result;
}

	var typeLinkedFrame = null;

	function GetLinkageMatrix(frameControl, includeTypes)
	{
		var result = '';
		var matrix = frameControl.getMatrix();
		for (var element in matrix)
		{
			var nodeControl = frameControl.getNodeControl(element);
			var linkageMatrix = nodeControl.getMatrix(includeTypes);
			result += nodeControl.getId() + ':   ' +
				JSON.stringify(linkageMatrix) + '\r\n';
		}
		return result;
	}

function p05CreateTypeLinkedFrame()
{
	var frame = new Frame();
	var frameControl = new FrameControl(frame);

	var nodeControlLink = frameControl.getNodeControl(frameControl.add());
	var nodeControlLT01 = frameControl.getNodeControl(frameControl.add());
	var nodeControlLT02 = frameControl.getNodeControl(frameControl.add());

	nodeControlLink.getAtomControl(nodeControlLink.add(new Atom(null, 'LinkTypes')));
	var tagControlLT01 = nodeControlLT01.getAtomControl(
		nodeControlLT01.add(new Atom(null, 'LinkType01'))
	).getTagsControl();
	var tagControlLT02 = nodeControlLT02.getAtomControl(
		nodeControlLT02.add(new Atom(null, 'LinkType02'))
	).getTagsControl();

	tagControlLT01.add(nodeControlLink.getId());
	tagControlLT02.add(nodeControlLink.getId());

	var nodeControl01 = frameControl.getNodeControl(frameControl.add());
	var nodeControl02 = frameControl.getNodeControl(frameControl.add());
	var nodeControl03 = frameControl.getNodeControl(frameControl.add());

	var tagsControl11 = nodeControl01.getAtomControl(
		nodeControl01.add(new Atom(null, '01 node 01 atom'))
	).getTagsControl();
	var tagsControl21 = nodeControl02.getAtomControl(
		nodeControl02.add(new Atom(null, '02 node 01 atom'))
	).getTagsControl();
	var tagsControl22 = nodeControl02.getAtomControl(
		nodeControl02.add(new Atom(null, '02 node 02 atom'))
	).getTagsControl();
	var tagsControl23 = nodeControl02.getAtomControl(
		nodeControl02.add(new Atom(null, '02 node 03 atom'))
	).getTagsControl();
	var tagsControl31 = nodeControl03.getAtomControl(
		nodeControl03.add(new Atom(null, '03 node 01 atom'))
	).getTagsControl();
	var tagsControl32 = nodeControl03.getAtomControl(
		nodeControl03.add(new Atom(null, '03 node 02 atom'))
	).getTagsControl();

	var tagControl = null;
	var nodeId = null;

	nodeId = nodeControl01.getId();
	tagsControl21.add(nodeId);
	tagControl = tagsControl21.getControl(nodeId);
	tagControl.add(nodeControlLT01.getId());

	nodeId = nodeControl03.getId();
	tagsControl21.add(nodeId);
	tagControl = tagsControl21.getControl(nodeId);
	tagControl.add(nodeControlLT01.getId());

	nodeId = nodeControl01.getId();
	tagsControl22.add(nodeId);
	tagControl = tagsControl22.getControl(nodeId);
	tagControl.add(nodeControlLT02.getId());

	nodeId = nodeControl03.getId();
	tagsControl23.add(nodeId);
	tagControl = tagsControl23.getControl(nodeId);
	tagControl.add(nodeControlLT02.getId());

	nodeId = nodeControl03.getId();
	tagsControl11.add(nodeId);
	tagControl = tagsControl11.getControl(nodeId);
	tagControl.add(nodeControlLT01.getId());
	tagControl.add(nodeControlLT02.getId());

	typeLinkedFrame = frame;

	var result =
		JSON.stringify(frame) + '\r\n' + '\r\n' +
		JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
		GetLinkageMatrix(frameControl, false) + '\r\n' +
		GetLinkageMatrix(frameControl, true) + '\r\n' +
		frameControl.stringify();
	return result;
}

function p06RemoveLinkTypesInFrame()
{
	var frame = typeLinkedFrame;
	var frameControl = new FrameControl(frame);

	var nodeMatrix = frameControl.getMatrix();
	for (var nodeId in nodeMatrix)
	{
		var nodeControl = frameControl.getNodeControl(nodeId);
		var atomsCount = nodeControl.getAtomsCount();
		for (var i = 0; i <atomsCount; ++i)
		{
			var atomControl = nodeControl.getAtomControl(i);
			var tagsControl = atomControl.getTagsControl();
			var tagsMatrix = tagsControl.getMatrix();
			for (var tagId in tagsMatrix)
			{
				var tagControl = tagsControl.getControl(tagId);

				var counter = 0;
				for (var nodeId in nodeMatrix)
				{
					if (counter++ > 1)
						break;
					tagControl.remove(nodeId);
				}
			}
		}
	}

	var result =
		JSON.stringify(frame) + '\r\n' + '\r\n' +
		JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
		GetLinkageMatrix(frameControl, false) + '\r\n' +
		GetLinkageMatrix(frameControl, true) + '\r\n' +
		frameControl.stringify();
	return result;
}

function p07ClearLinkTypesInFrame()
{
	var frame = typeLinkedFrame;
	var frameControl = new FrameControl(frame);

	var nodeMatrix = frameControl.getMatrix();
	for (var nodeId in nodeMatrix)
	{
		var nodeControl = frameControl.getNodeControl(nodeId);
		var atomsCount = nodeControl.getAtomsCount();
		for (var i = 0; i < atomsCount; ++i)
		{
			var atomControl = nodeControl.getAtomControl(i);
			var tagsControl = atomControl.getTagsControl();
			var tagsMatrix = tagsControl.getMatrix();
			for (var tagId in tagsMatrix)
			{
				var tagControl = tagsControl.getControl(tagId);
				tagControl.clear();
			}
		}
	}

	var result =
		JSON.stringify(frame) + '\r\n' + '\r\n' +
		JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
		GetLinkageMatrix(frameControl, false) + '\r\n' +
		GetLinkageMatrix(frameControl, true) + '\r\n' +
		frameControl.stringify();
	return result;
}

function p08RemoveTagsInFrame()
{
	var frame = typeLinkedFrame;
	var frameControl = new FrameControl(frame);

	var nodeMatrix = frameControl.getMatrix();
	for (var nodeId in nodeMatrix)
	{
		var nodeControl = frameControl.getNodeControl(nodeId);
		var atomsCount = nodeControl.getAtomsCount();
		for (var i = 0; i <atomsCount; ++i)
		{
			var atomControl = nodeControl.getAtomControl(i);
			var tagsControl = atomControl.getTagsControl();

			var counter = 0;
			for (var nodeId in nodeMatrix)
			{
				if (++counter % 2 === 0)
					continue;
				tagsControl.remove(nodeId);
			}
		}
	}

	var result =
		JSON.stringify(frame) + '\r\n' + '\r\n' +
		JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
		GetLinkageMatrix(frameControl, false) + '\r\n' +
		GetLinkageMatrix(frameControl, true) + '\r\n' +
		frameControl.stringify();
	return result;
}

function p09ClearTagsInFrame()
{
	var frame = typeLinkedFrame;
	var frameControl = new FrameControl(frame);

	var nodeMatrix = frameControl.getMatrix();
	for (var nodeId in nodeMatrix)
	{
		var nodeControl = frameControl.getNodeControl(nodeId);
		var atomsCount = nodeControl.getAtomsCount();
		for (var i = 0; i <atomsCount; ++i)
		{
			var atomControl = nodeControl.getAtomControl(i);
			var tagsControl = atomControl.getTagsControl();
			tagsControl.clear();
		}
	}

	var result =
		JSON.stringify(frame) + '\r\n' + '\r\n' +
		JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
		GetLinkageMatrix(frameControl, false) + '\r\n' +
		GetLinkageMatrix(frameControl, true) + '\r\n' +
		frameControl.stringify();
	return result;
}

// TODO: insert test for get/set content for node atoms.

function p10RemoveNodeAtomsInFrame()
{
	var frame = typeLinkedFrame;
	var frameControl = new FrameControl(frame);

	var nodeMatrix = frameControl.getMatrix();
	for (var nodeId in nodeMatrix)
	{
		var nodeControl = frameControl.getNodeControl(nodeId);
		nodeControl.remove(1);
	}

	var result =
		JSON.stringify(frame) + '\r\n' + '\r\n' +
		JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
		GetLinkageMatrix(frameControl, false) + '\r\n' +
		GetLinkageMatrix(frameControl, true) + '\r\n' +
		frameControl.stringify();
	return result;
}

function p11ClearNodeAtomsFrame()
{
	var frame = typeLinkedFrame;
	var frameControl = new FrameControl(frame);

	var nodeMatrix = frameControl.getMatrix();

	var counter = 0;
	for (var nodeId in nodeMatrix)
	{
		if (++counter % 2 === 0)
			continue;
		var nodeControl = frameControl.getNodeControl(nodeId);
		nodeControl.clear();
	}

	var result =
		JSON.stringify(frame) + '\r\n' + '\r\n' +
		JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
		GetLinkageMatrix(frameControl, false) + '\r\n' +
		GetLinkageMatrix(frameControl, true) + '\r\n' +
		frameControl.stringify();
	return result;
}

function p12RemoveNodesInFrame()
{
	var frame = typeLinkedFrame;
	var frameControl = new FrameControl(frame);

	var nodeMatrix = frameControl.getMatrix();

	var counter = 0;
	for (var nodeId in nodeMatrix)
	{
		if (++counter % 2 === 0)
			continue;
		frameControl.remove(nodeId);
	}

	var result =
		JSON.stringify(frame) + '\r\n' + '\r\n' +
		JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
		GetLinkageMatrix(frameControl, false) + '\r\n' +
		GetLinkageMatrix(frameControl, true) + '\r\n' +
		frameControl.stringify();
	return result;
}

function p13ClearNodesInFrame()
{
	var frame = typeLinkedFrame;
	var frameControl = new FrameControl(frame);
	frameControl.clear();

	var result =
		JSON.stringify(frame) + '\r\n' + '\r\n' +
		JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
		GetLinkageMatrix(frameControl, false) + '\r\n' +
		GetLinkageMatrix(frameControl, true) + '\r\n' +
		frameControl.stringify();
	return result;
}
