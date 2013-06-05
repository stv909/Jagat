var NG = NG || {};

NG.Uuid = function()
{
	var c = function() { return 0 };
	function b(a) { return a?(a^c()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b) }
	this.empty = b();

	c = function() { return Math.random() };
	this.generate = b;
};

function fillObjectProperties(pattern, custom)
{
	if (!pattern || typeof pattern !== 'object' || !custom)
		return;
	for (var propertyKey in pattern)
	{
		var customValue = custom[propertyKey];
		if (!customValue)
			continue;
		var property = pattern[propertyKey];
		if (property && typeof property === 'object')
		{
			fillObjectProperties(property, customValue);
		}
		else
		{
			pattern[propertyKey] = customValue;
		}
	}
}

NG.Node = function(initDesc)
{
	this.desc = {
		id: (new NG.Uuid()).generate(),
		uuid: null,
		name: '?',
		font: {name: 'helvetiker', size: 6.0, color: 0x757AD8},
		shape: {type: 'box', width: 64, height: 16, depth: 4, color: 0xFFFFFF},
		position: {x: 0, y: 0, z: 0}
	};
	fillObjectProperties(this.desc, initDesc);

	this.create = function()
	{
		function createShapeGeometry(desc)
		{
			var shapeCreation = {
				box: function(desc)
				{
					return new THREE.CubeGeometry(
						desc.width, desc.height, desc.depth,
						1, 1, 1
					);
				},
				arrow: function(desc)
				{
					var pikeWidthPart = 0.25;
					var pikeHeightPart = 0.45;
					var bodyWidthPart = 1.0 - pikeWidthPart;
					var bodyHeightPart = 1.0 - pikeHeightPart;

					var geometry = new THREE.CubeGeometry(
						bodyWidthPart * desc.width, bodyHeightPart * desc.height, desc.depth,
						1, 1, 1
					);
					var pike = new THREE.CylinderGeometry(
						0, 0.5 * desc.height, pikeWidthPart * desc.width, 16, 1, false
					);
					pike.applyMatrix(new THREE.Matrix4().makeRotationZ(-0.5 * Math.PI));
					pike.applyMatrix(new THREE.Matrix4().makeRotationX(0.25 * Math.PI));
					pike.applyMatrix(new THREE.Matrix4().makeTranslation(
							0.5 * (bodyWidthPart * desc.width + pikeWidthPart * desc.width),
							0,
							0
						)
					);
					THREE.GeometryUtils.merge(geometry, pike);
					return geometry;
				},
				disc: function(desc)
				{
					var radius = 0.5 * Math.min(desc.width, desc.height);
					// TODO: make ellipsoid instead of circle
					var segments = 32; // TODO: make it dependent from size of the circle/ellipse
					var geometry = new THREE.CylinderGeometry(radius, radius, desc.depth, segments, 1, false);
					geometry.applyMatrix(new THREE.Matrix4().makeRotationX(0.5 * Math.PI));
					return geometry;
				}
			};

			var create = shapeCreation[desc.type];
			if (create)
				return create(desc);
			return null;
		}

		var shapeMaterial = new THREE.MeshLambertMaterial(
			{
				color: this.desc.shape.color
			}
		);

		var textMaterial = new THREE.MeshLambertMaterial(
			{
				color: this.desc.font.color
			}
		);

		var shape = new THREE.Mesh(createShapeGeometry(this.desc.shape), shapeMaterial);

		var textGeom = new THREE.TextGeometry(
			this.desc.name,
			{
				size: this.desc.font.size, // <float> // size of the text
				height: 2.0, // <float> // thickness to extrude text
				curveSegments: 3, // <int> // number of points on the curves

				font: this.desc.font.name, // <string> // font name
				weight: 'bold', // <string> // font weight (normal, bold)
				style: 'normal', // <string> // font style  (normal, italics)

				bevelEnabled: false, // <bool> // turn on bevel
				bevelThickness: 0.25, // <float> // how deep into text bevel goes
				bevelSize: 0.25 // <float> // how far from text outline is bevel
			}
		);
		textGeom.dynamic = true;
		THREE.GeometryUtils.center(textGeom);

		var text = new THREE.Mesh(
			textGeom,
			textMaterial
		);
		text.position.z = this.desc.shape.depth;

		shape.add(text);
		if (this.desc.position)
		{
			shape.position.set(this.desc.position.x, this.desc.position.y, this.desc.position.z);
		}
		shape.ngObject = this;
		return shape;
	};

	var object3D = this.create();

	this.getObject3D = function() { return object3D; };
	this.recreateObject3D = function() { object3D = this.create(); };
};

NG.Link = function(initDesc, initGalaxy)
{
	var defaultArrowWidth = 6;
	var defaultArrowLength = 10;
	this.desc = {
			id: (new NG.Uuid()).generate(),
			originNodeId: null,
			targetNodeId: null,
			names: [''],
			arrow: {width: defaultArrowWidth, length: defaultArrowLength, color: 0x66A968},
			font: {name: 'helvetiker', size: 6.0, color: 0xDDC50F}
	};
	fillObjectProperties(this.desc, initDesc);
	this.ownerGalaxy = initGalaxy || null;
	this.arrowGeom = null;
	this.arrow = null;
	this.textGeom = null;
	this.text = null;

	this.update = function()
	{
		function centerText(text, startPoint, endPoint)
		{
			var center = new THREE.Vector3();
			center.addVectors(startPoint, endPoint);
			center.multiplyScalar(0.5);
			text.position = center;
		}

		function constructArrow(lineGeometry, startPoint, endPoint, tracePoint, arrowDesc)
		{
			var arrowDirection = new THREE.Vector3();
			arrowDirection.subVectors(endPoint, startPoint);
			arrowDirection.normalize();
			var subendPoint = new THREE.Vector3(tracePoint.x, tracePoint.y, tracePoint.z);
			var arrowShift = new THREE.Vector3(arrowDirection.x, arrowDirection.y, arrowDirection.z);
			arrowShift.multiplyScalar(arrowDesc.length);
			subendPoint.sub(arrowShift);
			arrowDirection.applyAxisAngle(new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(90));

			var arrowDotLeft = new THREE.Vector3(arrowDirection.x, arrowDirection.y, arrowDirection.z);
			arrowDotLeft.multiplyScalar(0.5 * arrowDesc.width);
			arrowDotLeft.add(subendPoint);
			var arrowDotRight = new THREE.Vector3(arrowDirection.x, arrowDirection.y, arrowDirection.z);
			arrowDotRight.multiplyScalar(-0.5 * arrowDesc.width);
			arrowDotRight.add(subendPoint);

			lineGeometry.vertices = [];
			lineGeometry.vertices.push(startPoint);
			lineGeometry.vertices.push(endPoint);

			lineGeometry.vertices.push(tracePoint);
			lineGeometry.vertices.push(arrowDotLeft);
			lineGeometry.vertices.push(arrowDotRight);
			lineGeometry.vertices.push(tracePoint);

			lineGeometry.verticesNeedUpdate = true;
		}

		if (
			this.desc.originNodeId && this.desc.targetNodeId &&
			this.ownerGalaxy
		)
		{
			var originVertex = this.ownerGalaxy.getNodePosition(this.desc.originNodeId);
			var targetVertex = this.ownerGalaxy.getNodePosition(this.desc.targetNodeId);
			if (originVertex && targetVertex)
			{
				var traceVertex = this.ownerGalaxy.getNodeRayTracePosition(
					this.desc.targetNodeId, {origin: originVertex, target: targetVertex}
				);
				if (!traceVertex)
				{
					traceVertex = targetVertex;
				}
				constructArrow(this.arrowGeom, originVertex, targetVertex, traceVertex, this.desc.arrow);
				centerText(this.text, originVertex, targetVertex);
			}
		}
	};

	this.create = function()
	{
		var arrowMaterial = new THREE.LineBasicMaterial(
			{
				color: this.desc.arrow.color,
				opacity: 1.0,
				linewidth: 1.0,
				vertexColors: false
			}
		);

		var textMaterial = new THREE.MeshLambertMaterial(
			{
				color: this.desc.font.color
			}
		);

		var linkName = '';
		for (var i = 0; i < this.desc.names.length; ++i)
		{
			linkName += (i > 0 ? ', ' : '') + this.desc.names[i];
		}
		if (linkName === '')
		{
			linkName = '*';
		}
		// TODO: implement multiline text support instead of comma separation.

		this.textGeom = new THREE.TextGeometry(
			linkName,
			{
				size: this.desc.font.size, // <float> // size of the text
				height: 2.0, // <float> // thickness to extrude text
				curveSegments: 3, // <int> // number of points on the curves

				font: this.desc.font.name, // <string> // font name
				weight: 'bold', // <string> // font weight (normal, bold)
				style: 'normal', // <string> // font style  (normal, italics)

				bevelEnabled: false, // <bool> // turn on bevel
				bevelThickness: 0.25, // <float> // how deep into text bevel goes
				bevelSize: 0.25 // <float> // how far from text outline is bevel
			}
		);
		this.textGeom.dynamic = true;
		THREE.GeometryUtils.center(this.textGeom);
		this.text = new THREE.Mesh(this.textGeom, textMaterial);

		this.arrowGeom = new THREE.Geometry();
		this.arrow = new THREE.Line(
			this.arrowGeom,
			arrowMaterial
		);

		this.arrow.add(this.text);
		this.update();

		this.arrow.ngObject = this;
		return this.arrow;
	};

	var object3D = this.create();

	this.getObject3D = function() { return object3D; };
	this.recreateObject3D = function() { object3D = this.create(); };
};

NG.UserControl = function(initGalaxy, initNGCamera, container)
{
	var ownerGalaxy = initGalaxy || null;
	var ngCamera = initNGCamera || null;
	var camera = ngCamera.getObject3D();
	var projector = new THREE.Projector();

	var INTERSECTED = null;
	var SELECTED = null;
	var OFFSET = new THREE.Vector3();
	var PLANE = new THREE.Mesh(
		new THREE.PlaneGeometry(2000, 2000, 8, 8),
		new THREE.MeshBasicMaterial(
			{color: 0x000000, opacity: 0.25, transparent: true, wireframe: true}
		)
	);

	var mouse = {x: 0, y:0};
	var mousePrior = {x: mouse.x, y: mouse.y};
	var cameraPrior = {x: camera.position.x, y: camera.position.y};
	var mouseDown = false;
	var disconnectCamera = false;

	container.addEventListener(
		'mousedown',
		function(event)
		{
			event.preventDefault();
			if (event.which === 1)
			{
				mouseDown = true;
			}
			handleMouseDown();
		},
		false
	);
	document.addEventListener(
		'mousemove',
		function(event)
		{
			mouse.x = ( (event.pageX - container.offsetLeft) / ngCamera.screen.width ) * 2 - 1;
			mouse.y = -( (event.pageY - container.offsetTop) / ngCamera.screen.height ) * 2 + 1;
			if (event.which !== 1)
			{
				mouseDown = false;
			}
			handleMouseMove();
		},
		false
	);
	document.addEventListener(
		'mouseup',
		function(event)
		{
			if (event.which === 1)
			{
				mouseDown = false;
			}
			handleMouseUp();
		},
		false
	);
	container.addEventListener(
		'mousewheel',
		function(event)
		{
			event.preventDefault();
			if (event.wheelDeltaY > 0)
			{
				ngCamera.zoomIn();
			}
			else if (event.wheelDeltaY < 0)
			{
				ngCamera.zoomOut();
			}
		},
		false
	);

	this.update = function()
	{
		if (!mouseDown)
		{
			mousePrior = {x: mouse.x, y: mouse.y};
			cameraPrior = {x: camera.position.x, y: camera.position.y};
		}
		if (mouseDown && !disconnectCamera)
		{
			var Zfactor = -camera.position.z;

			camera.position.y = cameraPrior.y + (mouse.y - mousePrior.y) *
				(Zfactor * (1 / camera.aspect) * (Math.tan(camera.fov / 2)));
			camera.position.x = cameraPrior.x + (mouse.x - mousePrior.x) *
				(Zfactor * (Math.tan(camera.fov / 2)));
		}
	};

	function handleMouseDown()
	{
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);
		var raycaster = new THREE.Raycaster(
			camera.position,
			vector.sub(camera.position).normalize()
		);
		var intersects = raycaster.intersectObjects(ownerGalaxy.getNodeObjects3D());
		if (intersects.length > 0)
		{
			disconnectCamera = true;
			SELECTED = intersects[0].object;
			var intersects = raycaster.intersectObject(PLANE);
			OFFSET.copy(intersects[0].point).sub(PLANE.position);
			container.style.cursor = 'move';
		}
	}

	function handleMouseMove()
	{
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);
		var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

		var intersects = null;
		if (SELECTED)
		{
			intersects = raycaster.intersectObject(PLANE);
			if (intersects.length > 0)
			{
				SELECTED.position.copy(intersects[0].point.sub(OFFSET));

				// update all needed stuff after node position change
				if (SELECTED.ngObject)
				{
					var ngLinksToUpdate = ownerGalaxy.getLinksByNode(SELECTED.ngObject);
					if (ngLinksToUpdate)
					{
						for (var i = 0; i < ngLinksToUpdate.length; ++i)
						{
							ngLinksToUpdate[i].update();
						}
					}
				}
			}
			container.style.cursor = 'move';
		}
		else
		{
			intersects = raycaster.intersectObjects(ownerGalaxy.getNodeObjects3D());
			if (intersects.length > 0)
			{
				if (INTERSECTED != intersects[0].object)
				{
					if (INTERSECTED)
					{
						INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
					}
					INTERSECTED = intersects[0].object;
					INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
					PLANE.position.copy(INTERSECTED.position);
					PLANE.lookAt(camera.position);
				}
				container.style.cursor = 'pointer';
			}
			else
			{
				if (INTERSECTED)
				{
					INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
				}
				INTERSECTED = null;
				container.style.cursor = 'auto';
			}
		}
	}

	function handleMouseUp()
	{
		disconnectCamera = false;
		if (INTERSECTED)
		{
			PLANE.position.copy(INTERSECTED.position);
			SELECTED = null;
		}
		container.style.cursor = 'auto';
	}
};

NG.Camera = function(initScreen)
{
	this.screen = initScreen || {width: 0, height: 0};
	this.fov = 45;
	this.nearPlane = 0.1;
	this.farPlane =5000;
	this.zoomStep = 5;

	this.create = function()
	{
		var aspectRatio = this.screen.width / this.screen.height;
		var camera = new THREE.PerspectiveCamera(
			this.fov,
			aspectRatio,
			this.nearPlane,
			this.farPlane
		);
		camera.position.z = 300;
		return camera;
	};

	var object3D = this.create();

	this.getObject3D = function() { return object3D; };
	this.recreateObject3D = function() { object3D = this.create(); };

	this.zoomIn = function()
	{
		object3D.position.z += this.zoomStep;
	};

	this.zoomOut = function()
	{
		object3D.position.z -= this.zoomStep;
	};
};

NG.Lights = function()
{
	this.create = function()
	{
		var directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 0.8 );
		directionalLight.position.set( 0, 0, 1 );
		return directionalLight;
	};

	var object3D = this.create();

	this.getObject3D = function() { return object3D; };
	this.recreateObject3D = function() { object3D = this.create(); };
};

NG.Galaxy = function(initOptions)
{
	this.options = initOptions ||
		{
			container: 'nodeGalaxyContainer',
			nodeSize: {width: 64, height: 16},
			nodesDistance: 96,
			fontName: 'helvetiker',
			fontSize: 6.0
		};

	var renderer = null;
	var scene = null;
	var camera = null;
	var lights = null;
	var userControl = null;

	this.initialize = function()
	{
		renderer = new THREE.WebGLRenderer({ antialias: true });
		scene = new THREE.Scene();

		// set the scene size by container size
		var containerElement = document.getElementById(this.options.container);
		var WIDTH = parseInt(containerElement.style.width, 10);
		var HEIGHT = parseInt(containerElement.style.height, 10);
		camera = new NG.Camera({width: WIDTH, height: HEIGHT});
		scene.add(camera.getObject3D());
		lights = new NG.Lights();
		scene.add(lights.getObject3D());
		// start and attach the renderer
		renderer.setSize(WIDTH, HEIGHT);
		containerElement.appendChild(renderer.domElement);

		userControl = new NG.UserControl(this, camera, containerElement);
	};

	this.initialize();

	var nodes = {};
	var links = {};

	var nodeObjects3D = [];
	var linkObjects3D = [];

	var linksByNode = {};

	function collectObjects3D(objects, objects3D)
	{
		objects3D.length = 0;
		for (var id in objects)
		{
			objects3D.push(objects[id].getObject3D());
		}
	}

	this.addNode = function(desc)
	{
		var node = new NG.Node(desc);
		nodes[node.desc.id] = node;
		scene.add(node.getObject3D());
		nodeObjects3D.push(node.getObject3D());
	};
	this.delNode = function(id)
	{
		var node = nodes[id];
		if (node)
		{
			scene.remove(node.getObject3D());
			delete nodes[id];
			collectObjects3D(nodes, nodeObjects3D);
		}
	};
	this.addLink = function(desc)
	{
		function addLinksByNodeElement(linksByNode, linkId, nodeId)
		{
			if (!nodeId)
				return;
			if (!linksByNode[nodeId])
			{
				linksByNode[nodeId] = [];
			}
			linksByNode[nodeId].push(linkId);
		}

		var link = new NG.Link(desc, this);
		links[link.desc.id] = link;
		scene.add(link.getObject3D());
		linkObjects3D.push(link.getObject3D());
		addLinksByNodeElement(linksByNode, link.desc.id, link.desc.originNodeId);
		addLinksByNodeElement(linksByNode, link.desc.id, link.desc.targetNodeId);
	};
	this.delLink = function(id)
	{
		var link = links[id];
		if (link)
		{
			scene.remove(link.getObject3D());
			delete links[id];
			collectObjects3D(links, linkObjects3D);
		}
	};

	this.getNodePosition = function(id)
	{
		if (nodes[id] && nodes[id].getObject3D())
		{
			return nodes[id].getObject3D().position;
		}
		return null;
	};
	this.getNodeRayTracePosition = function(id, ray)
	{
		var node = nodes[id];
		if (node)
		{
			var object3D = node.getObject3D();
			var direction = new THREE.Vector3();
			direction.subVectors(ray.target, ray.origin);
			direction.normalize();
			var raycaster = new THREE.Raycaster(ray.origin, direction);
			object3D.updateMatrixWorld();
			var intersects = raycaster.intersectObject(object3D);
			if (intersects.length > 0)
			{
				return intersects[0].point;
			}
		}
		return null;
	};
	this.getNodeObjects3D = function() { return nodeObjects3D; };
	this.getLinkObjects3D = function() { return linkObjects3D; };
	this.getLinksByNode = function(node)
	{
		var linkIds = linksByNode[node.desc.id];
		if (!linkIds)
			return null;
		var resultLinks = [];
		for (var i = 0; i < linkIds.length; ++i)
		{
			var link = links[linkIds[i]];
			if (link)
			{
				resultLinks.push(link);
			}
		}
		return resultLinks;
	};

	this.load = function(nodeGalaxyDesc)
	{
		this.clear();
		if (nodeGalaxyDesc.nodes)
		{
			for (var nodeIndex = 0; nodeIndex < nodeGalaxyDesc.nodes.length; ++nodeIndex)
			{
				var node = nodeGalaxyDesc.nodes[nodeIndex];
				this.addNode(node);
			}
		}
		if (nodeGalaxyDesc.links)
		{
			for (var linkIndex = 0; linkIndex < nodeGalaxyDesc.links.length; ++linkIndex)
			{
				var link = nodeGalaxyDesc.links[linkIndex];
				this.addLink(link);
			}
		}
	};
	this.save = function()
	{
		var nodeGalaxyDesc = {};

		nodeGalaxyDesc.nodes = [];
		for (var nodeId in nodes)
		{
			var desc = nodes[nodeId].desc;
			var pos = nodes[nodeId].getObject3D().position;
			desc.position = {x: pos.x, y: pos.y, z: pos.z};
			nodeGalaxyDesc.nodes.push(desc);
		}

		nodeGalaxyDesc.links = [];
		for (var linkId in links)
		{
			nodeGalaxyDesc.links.push(links[linkId].desc);
		}

		return JSON.stringify(nodeGalaxyDesc, null, '\t');
	};
	this.clear = function()
	{
		for (var nodeId in nodes)
		{
			scene.remove(nodes[nodeId].getObject3D());
		}
		nodes = {};
		nodeObjects3D = [];

		for (var linkId in links)
		{
			scene.remove(links[linkId].getObject3D());
		}
		links = {};
		linkObjects3D = [];
	};

	var stopAnimation = false;
	this.animate = function()
	{
		function animate()
		{
			if (stopAnimation)
			{
				stopAnimation = false;
				return;
			}
			requestAnimationFrame(animate);
			userControl.update();
			renderer.render(scene, camera.getObject3D());
		}
		animate();
	};
	this.stop = function()
	{
		stopAnimation = true;
	};
};