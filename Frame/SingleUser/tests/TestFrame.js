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
			frameControl.getFrameCode();
		return result;
	};

	this.p03CreateSimpleFrame = function()
	{
		var frame = new Frame();
		var frameControl = new FrameControl(frame);

		var nodeControl01 = frameControl.getElement(frameControl.add());
		var nodeControl02 = frameControl.getElement(frameControl.add());
		var nodeControl03 = frameControl.getElement(frameControl.add());

		nodeControl01.setContent("01 node");
		nodeControl02.setContent("02 node");
		nodeControl03.setContent("03 node");

		var result =
			JSON.stringify(frame) + '\r\n' + '\r\n' +
			JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
			frameControl.getFrameCode();
		return result;
	};

		function GetLinkageMatrix(frameControl)
		{
			var result = '';
			var matrix = frameControl.getMatrix();
			for (var element in matrix)
			{
				var nodeControl = frameControl.getElement(element);
				var linkageMatrix = nodeControl.getMatrix();
				result += nodeControl.getId() + ':   ' +
					JSON.stringify(linkageMatrix) + '\r\n';
			}
			return result;
		}

	this.p04CreateLinkedFrame = function()
	{
		var frame = new Frame();
		var frameControl = new FrameControl(frame);

		var nodeControl01 = frameControl.getElement(frameControl.add());
		var nodeControl02 = frameControl.getElement(frameControl.add());
		var nodeControl03 = frameControl.getElement(frameControl.add());

		nodeControl02.add(nodeControl01.getId());
		nodeControl02.add(nodeControl03.getId());
		nodeControl01.add(nodeControl03.getId());

		var result =
			JSON.stringify(frame) + '\r\n' + '\r\n' +
			JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
			GetLinkageMatrix(frameControl) + '\r\n' +
			frameControl.getFrameCode();
		return result;
	};

		var typeLinkedFrame = null;

	this.p05CreateAspectLinkedFrame = function()
	{
		var frame = new Frame();
		var frameControl = new FrameControl(frame);

		var nodeControlLink = frameControl.getElement(frameControl.add());
		var nodeControlLA01 = frameControl.getElement(frameControl.add());
		var nodeControlLA02 = frameControl.getElement(frameControl.add());
		nodeControlLink.setContent('Link Aspects');
		nodeControlLA01.setContent('01 Link Aspect');
		nodeControlLA02.setContent('02 Link Aspect');

		nodeControlLA01.add(nodeControlLink.getId());
		nodeControlLA02.add(nodeControlLink.getId());

		var nodeControl01 = frameControl.getElement(frameControl.add());
		var nodeControl02 = frameControl.getElement(frameControl.add());
		var nodeControl03 = frameControl.getElement(frameControl.add());
		nodeControl01.setContent('01 node');
		nodeControl02.setContent('02 node');
		nodeControl03.setContent('03 node');

		var linkId = nodeControl01.getId();
		nodeControl02.add(linkId);
		nodeControl02.getElement(linkId).add(nodeControlLA01.getId());

		linkId = nodeControl03.getId();
		nodeControl02.add(linkId);
		nodeControl02.getElement(linkId).add(nodeControlLA01.getId());
		nodeControl02.getElement(linkId).add(nodeControlLA02.getId());

		linkId = nodeControl03.getId();
		nodeControl01.add(linkId);
		nodeControl01.getElement(linkId).add(nodeControlLA02.getId());

		typeLinkedFrame = frame;

		var result =
			JSON.stringify(frame) + '\r\n' + '\r\n' +
			JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
			GetLinkageMatrix(frameControl) + '\r\n' +
			frameControl.getFrameCode();
		return result;
	};

	this.p06RemoveLinkAspectsInFrame = function()
	{
		var frame = typeLinkedFrame;
		var frameControl = new FrameControl(frame);

		var nodeMatrix = frameControl.getMatrix();
		for (var nodeId in nodeMatrix)
		{
			var nodeControl = frameControl.getElement(nodeId);
			var linksMatrix = nodeControl.getMatrix();
			for (var linkId in linksMatrix)
			{
				var linkControl = nodeControl.getElement(linkId);
				var counter = 0;
				for (var aspectId in nodeMatrix)
				{
					if (counter++ > 1)
						break;
					linkControl.remove(aspectId);
				}
			}
		}

		var result =
			JSON.stringify(frame) + '\r\n' + '\r\n' +
			JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
			GetLinkageMatrix(frameControl) + '\r\n' +
			frameControl.getFrameCode();
		return result;
	};

	this.p07ClearLinkAspectsInFrame = function()
	{
		var frame = typeLinkedFrame;
		var frameControl = new FrameControl(frame);

		var nodeMatrix = frameControl.getMatrix();
		for (var nodeId in nodeMatrix)
		{
			var nodeControl = frameControl.getElement(nodeId);
			{
				var linkMatrix = nodeControl.getMatrix();
				for (var linkId in linkMatrix)
				{
					var linkControl = nodeControl.getElement(linkId);
					linkControl.clear();
				}
			}
		}

		var result =
			JSON.stringify(frame) + '\r\n' + '\r\n' +
			JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
			GetLinkageMatrix(frameControl) + '\r\n' +
			frameControl.getFrameCode();
		return result;
	};

	this.p08RemoveLinksInFrame = function()
	{
		var frame = typeLinkedFrame;
		var frameControl = new FrameControl(frame);

		var nodeMatrix = frameControl.getMatrix();
		var removeLinkId = null;
		for (var linkId in nodeMatrix)
		{
			removeLinkId = linkId;
		}
		for (var nodeId in nodeMatrix)
		{
			var nodeControl = frameControl.getElement(nodeId);
			nodeControl.remove(removeLinkId);
		}

		var result =
			JSON.stringify(frame) + '\r\n' + '\r\n' +
			JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
			GetLinkageMatrix(frameControl) + '\r\n' +
			frameControl.getFrameCode();
		return result;
	};

	this.p09ClearLinksInFrame = function()
	{
		var frame = typeLinkedFrame;
		var frameControl = new FrameControl(frame);

		var nodeMatrix = frameControl.getMatrix();
		for (var nodeId in nodeMatrix)
		{
			var nodeControl = frameControl.getElement(nodeId);
			nodeControl.clear();
		}

		var result =
			JSON.stringify(frame) + '\r\n' + '\r\n' +
			JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
			GetLinkageMatrix(frameControl) + '\r\n' +
			frameControl.getFrameCode();
		return result;
	};

	this.p10ChangeNodeContentInFrame = function()
	{
		var frame = typeLinkedFrame;
		var frameControl = new FrameControl(frame);

		var nodeMatrix = frameControl.getMatrix();
		for (var nodeId in nodeMatrix)
		{
			var nodeControl = frameControl.getElement(nodeId);
			var newContent = nodeControl.getContent() + ' <- modified!';
			nodeControl.setContent(newContent);
		}

		var result =
			JSON.stringify(frame) + '\r\n' + '\r\n' +
			JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
			GetLinkageMatrix(frameControl) + '\r\n' +
			frameControl.getFrameCode();
		return result;
	};

	this.p11RemoveNodesInFrame = function()
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
			GetLinkageMatrix(frameControl) + '\r\n' +
			frameControl.getFrameCode();
		return result;
	};

	this.p12ClearNodesInFrame = function()
	{
		var frame = typeLinkedFrame;
		var frameControl = new FrameControl(frame);
		frameControl.clear();

		var result =
			JSON.stringify(frame) + '\r\n' + '\r\n' +
			JSON.stringify(frameControl.getMatrix()) + '\r\n' + '\r\n' +
			GetLinkageMatrix(frameControl) + '\r\n' +
			frameControl.getFrameCode();
		return result;
	};
}