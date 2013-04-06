function runAllTests(output)
{
	function resetView()
	{
		output.innerHTML = '';
	}

	function pushResults()
	{
		function generateTestParagraph(testFunctionName, resultText)
		{
			var testParagraph = document.createElement('p');
			var testTitle = document.createTextNode(testFunctionName);
			var view = document.createElement('textarea');
			view.textContent = resultText;

			testParagraph.appendChild(testTitle);
			testParagraph.appendChild(document.createElement('br'));
			testParagraph.appendChild(view);
			return testParagraph;
		}

		var pull = new testPull();
		for (var testFunctionName in pull)
		{
			var resultText = '[invalid test function object]';
			if (typeof pull[testFunctionName] === 'function')
			{
				resultText = pull[testFunctionName]();
			}
			output.appendChild(generateTestParagraph(testFunctionName, resultText));
		}
	}

	function pushMessage(messageText)
	{
		var messageParagraph = output.appendChild(document.createElement('p'));
		messageParagraph.innerHTML = messageText;
		output.appendChild(messageParagraph);
	}

	resetView();
	pushResults();
	pushMessage('Test run complete!');
}

function testPull()
{
	this.p01GenerateUuids = function()
	{
		var uuid = new Uuid();
		return uuid.empty + '\r\n' + uuid.generate() + '\r\n' +
			uuid.generate() + '\r\n' + uuid.generate();
	}

	this.p02CreateVoidFrame = function()
	{
		var frame = new Frame();
		var frameControl = new FrameControl(frame);

		var result =
			JSON.stringify(frame) + '\r\n' + '\r\n' +
			JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
			frameControl.stringify();
		return result;
	};

	this.p03CreateSimpleFrame = function()
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
	};

	this.p04CreateLinkedFrame = function()
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
	};

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

	this.p05CreateTypeLinkedFrame = function()
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
	};

	this.p06RemoveLinkTypesInFrame = function()
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
	};

	this.p07ClearLinkTypesInFrame = function()
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
	};

	this.p08RemoveTagsInFrame = function()
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
	};

	this.p09ClearTagsInFrame = function()
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
	};

	this.p10ChangeAtomsContentInFrame = function()
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
				var newContent = atomControl.getContent() + ' <- modified!';
				atomControl.setContent(newContent);
			}
		}

		var result =
			JSON.stringify(frame) + '\r\n' + '\r\n' +
			JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
			GetLinkageMatrix(frameControl, false) + '\r\n' +
			GetLinkageMatrix(frameControl, true) + '\r\n' +
			frameControl.stringify();
		return result;
	};

	this.p11RemoveNodeAtomsInFrame = function()
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
	};

	this.p12ClearNodeAtomsFrame = function()
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
	};

	this.p13RemoveNodesInFrame = function()
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
	};

	this.p14ClearNodesInFrame = function()
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
	};
}