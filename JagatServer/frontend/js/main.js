function main()
{
	// SubScene object
	var SubScene = function(parentScene)
	{
		this.sceneObjects = [];
		this.sceneHelpers = [];
		this.lineHelper = null;
		this.scene = parentScene;
	};

	SubScene.prototype.fill = function(sceneObjects)
	{
		for (var i = 0; i < sceneObjects.length; ++i)
		{
			this.sceneObjects.push(sceneObjects[i]);
			this.scene.add(sceneObjects[i]);
		}
	};

	SubScene.prototype.clear = function()
	{
		this.clearHelpers();
		for (var i = 0; i < this.sceneObjects.length; ++i)
		{
			this.scene.remove(this.sceneObjects[i]);
		}
		this.sceneObjects = [];
		MOVING = null;
		SELECTED = null;
		INTERSECTED = null;
	};

	SubScene.prototype.replaceSceneObject = function(sceneObject)
	{
		for (var i = 0; i < this.sceneObjects.length; ++i)
		{
			if (this.sceneObjects[i].guid === sceneObject.guid)
			{
				var makeMoving = (MOVING === this.sceneObjects[i]);
				var makeSelected = (SELECTED === this.sceneObjects[i]);
				this.scene.remove(this.sceneObjects[i]);
				this.sceneObjects[i] = sceneObject;
				this.scene.add(sceneObject);
				if (makeMoving)
				{
					MOVING = sceneObject;
				}
				if (makeSelected)
				{
					setSelectedObject(sceneObject);
				}
				return;
			}
		}
		console.log("Can't replace object:");
		console.log(sceneObject);
	}

	SubScene.prototype.fillHelpers = function(sceneHelpers)
	{
		var lineGeom = new THREE.Geometry();
		for (var i = 0; i < sceneHelpers.length; ++i)
		{
			lineGeom.vertices.push(sceneHelpers[i].position);
			this.sceneHelpers.push(sceneHelpers[i]);
			this.scene.add(sceneHelpers[i]);
		}
		this.lineHelper = new THREE.Line(lineGeom, helperLineMaterial);
		this.lineHelper.guid = 'helper_line';
		this.sceneHelpers.push(this.lineHelper);
		this.scene.add(this.lineHelper);
	};

	SubScene.prototype.clearHelpers = function()
	{
		for (var i = 0; i < this.sceneHelpers.length; ++i)
		{
			this.scene.remove(this.sceneHelpers[i]);
		}
		this.sceneHelpers = [];
		this.lineHelper = null;
	};

	SubScene.prototype.updateHelperLineVertex = function(vertexObject)
	{
		if (!this.lineHelper || !vertexObject.helperIndex)
			return;
		this.lineHelper.geometry.vertices[vertexObject.helperIndex] = vertexObject.position;
		this.lineHelper.geometry.verticesNeedUpdate = true;
	}

	// EventsController object
	var EventsController = function()
	{
		this.textData = "";
		this.jsonObject = null;
		this.objectUpdated = false;
		this.onChange = null;
	};

	EventsController.prototype.setData = function(text)
	{
		this.textData = text;
		var json = null;
		try
		{
			json = eval("(" + this.textData + ")"); // TODO: avoid evil
			if (currentSpacePath === "")
			{
				currentSpacePath = json.node.guid;
			}
		}
		catch(e)
		{
			json = null;
		}
		if (json !== null)
		{
			this.jsonObject = json;
			this.objectUpdated = true;
		}
	};

	EventsController.prototype.getData = function()
	{
		return this.textData;
	};

	EventsController.prototype.getObject = function()
	{
		return this.jsonObject;
	};

	EventsController.prototype.elementChanged = function(guid, helperIndex, newPosition)
	{
		if (this.onChange)
		{
			if (!helperIndex)
			{
				this.onChange({"action" : "positionUpdate", "guid": guid, "position": newPosition});
			}
			else
			{
				this.onChange({"action" : "vertexUpdate", "guid": guid, "index": helperIndex, "position": newPosition});
			}
		}
	};

	// OT3D object
	var OT3D = function(eventsController)
	{
		var docName = "pad:" + document.location.hash.slice(1);
		sharejs.open(
			docName, 'text',
			function(error, doc)
			{
				if (error)
				{
					console.error(error);
					return;
				}
				if (doc.created)
				{
					doc.submitOp({i:'Edit me!'});
				}
				doc.attach_events(eventsController);
			}
		);

		function applyToShareJS(eventsController, change, doc)
		{
			switch (change.action)
			{
				case 'positionUpdate':
					var posStartEnd = getPositionInterval(eventsController, change.guid);
					if (!posStartEnd)
					{
						console.error("Can not update object's position changed in 3d:");
						console.error(change);
						return;
					}
					// apply changes for local text cache
					var text = eventsController.getData();
					var newText =
						text.substring(0, posStartEnd.start) +
						getJsonNodePosition(change.position) +
						text.substring(posStartEnd.end + 1);
					eventsController.setData(newText);
					// apply changes for OT
					doc.del(posStartEnd.start, posStartEnd.end - posStartEnd.start + 1);
					doc.insert(posStartEnd.start, getJsonNodePosition(change.position));
					break;
				case 'vertexUpdate':
					var posStartEnd = getVerticesInterval(eventsController, change.guid, change.index);
					if (!posStartEnd)
					{
						console.error("Can not update object's vertex changed in 3d:");
						console.error(change);
						return;
					}
					// apply changes for local text cache
					var text = eventsController.getData();
					var newText =
						text.substring(0, posStartEnd.start) +
						getJsonVertexPosition(change.position) +
						text.substring(posStartEnd.end + 1);
					eventsController.setData(newText);
					// apply changes for OT
					doc.del(posStartEnd.start, posStartEnd.end - posStartEnd.start + 1);
					doc.insert(posStartEnd.start, getJsonVertexPosition(change.position));
					break;
				default:
					throw new Error("unknown action: " + change.action);
			}

			function getPositionInterval(eventsController, elemId)
			{
				var text = eventsController.getData();
				var idIndex = text.indexOf("\"guid\": \"" + elemId + "\""); // TODO: handle different formatting.
				if (idIndex < 0) // TODO: handle case of invalid object guid in JSON
					return null;
				var posStartIndex = text.indexOf("\"position\": {", idIndex);
				if (posStartIndex < 0) // TODO: handle case of invalid object position in JSON
					return null;
				var posEndIndex = text.indexOf("}", posStartIndex);
				if (posEndIndex < 0) // TODO: handle case of invalid object position in JSON
					return null;

				return {"start": posStartIndex, "end": posEndIndex};
			}

			function getJsonNodePosition(position)
			{
				return '"position": ' + JSON.stringify(position).replace(/:/g, ': ').replace(/,/g, ', ');
			}

			function getVerticesInterval(eventsController, elemId, vertexIndex)
			{
				var text = eventsController.getData();
				var idIndex = text.indexOf("\"guid\": \"" + elemId + "\""); // TODO: handle different formatting.
				if (idIndex < 0) // TODO: handle case of invalid object guid in JSON
					return null;
				var posStartIndex = text.indexOf("\"vertices\": [", idIndex);
				if (posStartIndex < 0) // TODO: handle case of invalid object position in JSON
					return null;
				var posEndIndex = text.indexOf("]", posStartIndex);
				if (posEndIndex < 0) // TODO: handle case of invalid object position in JSON
					return null;

				var currentVertexIndex = -1;
				for (var i = posStartIndex; i < posEndIndex; ++i)
				{
					if (text[i] == '{')
					{
						++currentVertexIndex;
					}
					if (currentVertexIndex == vertexIndex)
					{
						for (var j = i; j < posEndIndex; ++j)
						{
							if (text[j] == '}')
								return {"start": i, "end": j};
						}
					}
				}

				return null;
			}

			function getJsonVertexPosition(position)
			{
				return JSON.stringify(position).replace(/:/g, ': ').replace(/,/g, ', ');
			}
		}

		window.sharejs.extendDoc(
			"attach_events",
			function(eventsController)
			{
				var doc = this;
				if (!doc.provides['text'])
				{
					throw new Error('Only text documents can be attached to ace');
				}
			    eventsController.setData(doc.getText());
				check();
				var suppress = false;
				eventsController.onChange = eventsControllerListener;

				doc.on(
					'insert',
					function(pos, text)
					{
						suppress = true;
						eventsController.setData(doc.getText()); // TODO: optimize it and use pos, text
						suppress = false;
						return check();
					}
				);

				doc.on(
					'delete',
					function(pos, text)
					{
						suppress = true;
						eventsController.setData(doc.getText()); // TODO: optimize it and use pos, text
						suppress = false;
						return check();
					}
				);

				function check()
				{
					return window.setTimeout(
						function()
						{
							var editorText, otText;
							editorText = eventsController.getData();
							otText = doc.getText();
							if (editorText !== otText)
							{
								console.error("Text does not match!");
								console.error("editor: " + editorText);
								return console.error("ot:     " + otText);
							}
						},
						0
					);
			    }

				function eventsControllerListener(change)
				{
					if (suppress)
						return;
					applyToShareJS(eventsController, change, doc);
					return check();
				};

				doc.detach_ace = function()
				{
					eventsController.onChange = null;
					return delete doc.detach_ace;
				};
			}
		);
	};

	// standard global variables
    var mouse = new THREEx.MouseState();
    var container, scene, camera, renderer, controls, stats, projector;

	// custom global variables
	var sphereGeom, helperGeom, sceneMaterial, seatMaterial, stageMaterial, helperMaterial, helperLineMaterial, highlightMaterial, selectMaterial;
	var
        INTERSECTED = null,
        SELECTED = null,
        selectionDone = false,
        MOVING = null,
        MOVINGstate = "none",
        MOVINGcontroloffset = {x: 0, y: 0};
	var canvas1, context1;
	var sprite1, texture1;
	var effect, activerenderer;
	var subscene;
	var currentSpacePath = "";

	var eventsController = new EventsController();
	var ot3d = new OT3D(eventsController);

	init();
	animate();

	// FUNCTIONS

	function init()
	{
		initCommon();

		////////////////////////////
		// HIGHLIGHT AND TOOLTOPS //
		////////////////////////////

		// initialize object to perform world/screen calculations
		projector = new THREE.Projector();

		/////// draw text on canvas /////////

		// create a canvas element
		canvas1 = document.createElement('canvas');
		context1 = canvas1.getContext('2d');
		context1.font = "Bold 20px Arial";
		context1.fillStyle = "rgba(0,0,0,0.95)";
		context1.fillText('Hello, world!', 0, 20);

		// canvas contents will be used for a texture
		texture1 = new THREE.Texture(canvas1)
		texture1.needsUpdate = true;

        ////////////////////////////////////////

		sprite1 = new THREE.Sprite({map: texture1, useScreenCoordinates: true, alignment: THREE.SpriteAlignment.topLeft});
		sprite1.position.set(50, 50, 0);
		scene.add(sprite1);

		// update position of sprite1 depending of mouse move
		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('mouseup', onDocumentMouseUp, false);

		//////////////////////////////////////////

		selectionDone = false;
		$('#loader').fadeOut(1000);
		$('#spaceBack').click(onSpaceBackClock);
		$('#fullscreenToggle').click(onFullscreen);
		$('#asciiToggle').click(onAscii);
		$('#yMove').mousedown(onMovingYMouseDown);
		$('#xzMove').mousedown(onMovingXZMouseDown);

		focusCameraOnCurrentSpaceLayer();

		function initCommon()
		{
			// SCENE
			scene = new THREE.Scene();
			// CAMERA
			var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
			var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
			camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
			scene.add(camera);
			// RENDERER
			container = document.createElement('div');
			document.body.appendChild(container);

			renderer = new THREE.WebGLRenderer({antialias: true});
			renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

			// CONTROLS
			controls = new THREE.TrackballControls(camera);
			controls.noPan = true;
			// STATS
			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.bottom = '0px';
			stats.domElement.style.zIndex = 100;
			container.appendChild(stats.domElement);
			// LIGHT
			var light = new THREE.PointLight(0xffffff);
			light.position.set(0, 250, 0);
			scene.add(light);
			// SKYBOX/FOG
			scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);

			// radius, segments along width, segments along height
			sphereGeom =  new THREE.SphereGeometry(40, 32, 16);
			helperGeom =  new THREE.SphereGeometry(10, 8, 8);
			sceneMaterial = new THREE.MeshBasicMaterial({color: 0x888888, transparent: true, opacity: 1.0, side: THREE.DoubleSide});
			seatMaterial = new THREE.MeshBasicMaterial({color: 0xeeee00, transparent: true, opacity: 0.5});
			helperMaterial = new THREE.MeshBasicMaterial({color: 0x000000, transparent: false});
			helperLineMaterial = new THREE.LineBasicMaterial({color: 0x000000, transparent: false});
			stageMaterial = new THREE.MeshBasicMaterial({color: 0xee00ee, transparent: true, opacity: 0.5, side: THREE.DoubleSide});
			highlightMaterial = new THREE.MeshBasicMaterial({color: 0x0000ee, transparent: true, opacity: 0.75});
			selectMaterial = new THREE.MeshBasicMaterial({color: 0x00ee00, transparent: true, opacity: 0.25});

			// EFFECT
			effect = new THREE.AsciiEffect(renderer, ' .,:;=|iI+hHOE#`$');
			effect.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

			// EVENTS
			THREEx.WindowResize(renderer, camera, effect);

			// SUBSCENE
			subscene = new SubScene(scene);

			setActiveRenderer(renderer);
		}

		function setActiveRenderer(newrenderer)
		{
			activerenderer = newrenderer;

			var children = container.childNodes;
			for (var i = 0; i<children.length; i++)
			{
				if (children[i] == renderer.domElement || children[i] == effect.domElement)
				{
					container.removeChild(children[i]);
					i--;
				}
			}
			container.appendChild(activerenderer.domElement);
		}

		function onDocumentMouseMove(event)
		{
			// the following line would stop any other event handler from firing
			// (such as the mouse's TrackballControls)
			// event.preventDefault();

			// update sprite position
			sprite1.position.set(event.clientX, event.clientY, 0);

			if (MOVINGstate != "none" && MOVING)
			{
				// place moving control
				var newOffset = {
					top: event.clientY + MOVINGcontroloffset.y,
					left: event.clientX + MOVINGcontroloffset.x
				};

				// create a Ray with origin at the position and direction into the scene
				var vector = new THREE.Vector3(
					( newOffset.left / window.innerWidth ) * 2.0 - 1.0,
					- ( newOffset.top / window.innerHeight ) * 2.0 + 1.0,
					1
				);
				projector.unprojectVector(vector, camera);
				var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());

				if (MOVINGstate == "xOz")
				{
					// create plane mesh for xOz plane of MOVING object for projection
					var plane = new THREE.PlaneGeometry(50000, 50000, 1, 1);
					var planeMesh = new THREE.Mesh(plane, stageMaterial);
					planeMesh.rotation.set(-Math.PI * 0.5, 0, 0);
					planeMesh.position.set(0, MOVING.position.y, 0);
					planeMesh.updateMatrix();
					planeMesh.updateMatrixWorld();
					// find intersection of ray and plane
					var intersects = ray.intersectObjects([planeMesh]);
					if (intersects.length > 0)
					{
						MOVING.position = intersects[0].point;
						MOVING.updated = true;
					}
					// update helpers drawing if needed
					if (MOVING.helperOwner)
					{
						subscene.updateHelperLineVertex(MOVING);
					}
				}
				else if (MOVINGstate == "Oy")
				{
					var dir = new THREE.Vector3(0.0, 1.0, 0.0);
					var rayObject = new THREE.Ray(MOVING.position, dir);
					var point = getProjectionPoint(rayObject, ray);
					if (point)
					{
						MOVING.position.set(point.x, point.y, point.z);
						MOVING.updated = true;
					}
				}
			}

			function getProjectionPoint(rayObject, rayUser)
			{
				var lineObject = {a: getRayPoint(rayObject, -5000), b: getRayPoint(rayObject, 5000)};
				var lineUser = {a: getRayPoint(rayUser, -5000), b: getRayPoint(rayUser, 5000)};
				var shortestLine = getShortestLine(lineObject, lineUser);
				if (shortestLine)
					return shortestLine.a;
				return null;
			}

			function getRayPoint(ray, t)
			{
				return new THREE.Vector3(
					ray.origin.x + t * ray.direction.x,
					ray.origin.y + t * ray.direction.y,
					ray.origin.z + t * ray.direction.z
				);
			}

			function getShortestLine(line1, line2)
			{
				var p1 = new THREE.Vector3(line1.a.x, line1.a.y, line1.a.z);
				var p2 = new THREE.Vector3(line1.b.x, line1.b.y, line1.b.z);
				var p3 = new THREE.Vector3(line2.a.x, line2.a.y, line2.a.z);
				var p4 = new THREE.Vector3(line2.b.x, line2.b.y, line2.b.z);
				var p13 = new THREE.Vector3()
				p13.sub(p1, p3);
				var p43 = new THREE.Vector3()
				p43.sub(p4, p3);
				var p21 = new THREE.Vector3()
				p21.sub(p2, p1);

				if (p43.lengthSq() < 0.00001)
					return null;
				if (p21.lengthSq() < 0.00001)
					return null;

				var d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
				var d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
				var d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
				var d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
				var d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;

				var denom = d2121 * d4343 - d4321 * d4321;
				if (Math.abs(denom) < Math.Epsilon)
					return null;

				var numer = d1343 * d4321 - d1321 * d4343;
				var mua = numer / denom;
				var mub = (d1343 + d4321 * mua) / d4343;

				var result1 = new THREE.Vector3(
					p1.x + mua * p21.x,
					p1.y + mua * p21.y,
					p1.z + mua * p21.z
				);
				var result2 = new THREE.Vector3(
					p3.x + mub * p43.x,
					p3.y + mub * p43.y,
					p3.z + mub * p43.z
				);
				return {a: result1, b: result2};
			}
		}

		function onDocumentMouseUp(event)
		{
			if (MOVINGstate != "none")
			{
				controls.enabled = true;
				MOVINGstate = "none";
				if (MOVING && MOVING.updated)
				{
					if (!MOVING.helperOwner)
					{
						eventsController.elementChanged(MOVING.guid, null, MOVING.position);
					}
					else
					{
						var localPos = new THREE.Vector3();
						localPos.sub(MOVING.position, MOVING.helperOwner.position);
						var newVertexPosition = new THREE.Vector2(localPos.x, -localPos.z);
						eventsController.elementChanged(MOVING.helperOwner.guid, MOVING.helperIndex, newVertexPosition);
					}
					MOVING.updated = false;
				}
			}
		}

		function onSpaceBackClock()
		{
			var lastDotIndex = currentSpacePath.lastIndexOf('.');
			if (lastDotIndex != -1)
			{
				currentSpacePath = currentSpacePath.substr(0, lastDotIndex);
				subscene.clear();
				var objs = getSpaceLayer(currentSpacePath);
				if (objs)
				{
					subscene.fill(objs);
				}
				focusCameraOnCurrentSpaceLayer();
			}
		}

		function onFullscreen()
		{
			if (!THREEx.FullScreen.activated())
			{
				THREEx.FullScreen.request(document.body);
			}
			else
			{
				THREEx.FullScreen.cancel();
			}
		}

		function onAscii()
		{
			setActiveRenderer(activerenderer == effect ? renderer : effect);
		}

		function onMovingYMouseDown(event)
		{
			_onMovingXYZ(event, "Oy");
		}

		function onMovingXZMouseDown(event)
		{
			_onMovingXYZ(event, "xOz");
		}

		function _onMovingXYZ(event, state)
		{
			controls.enabled = false;
			MOVINGstate = state;
			var movingPos = $("#moving").offset();
			MOVINGcontroloffset = {
				x: movingPos.left - event.clientX,
				y: movingPos.top - event.clientY
			};
		}
	}

	function focusCameraOnCurrentSpaceLayer()
	{
		camera.position.set(-300, 500, -800);
		camera.lookAt(scene.position);
	}

	function getSpaceLayer(path)
	{
		var layerRootNode = getNodeByPath(eventsController.getObject(), path);
		if (!layerRootNode)
			return null;
		return createChildrenForNode(layerRootNode);

		function getNodeByPath(jsonObject, path)
		{
			if (!jsonObject)
				return null;
			var crumbs = path.split('.');
			var resultNode = null;
			for (var i = 0; i < crumbs.length; ++i)
			{
				if (i === 0)
				{
					if (!jsonObject.node || jsonObject.node.guid != crumbs[i])
						return null;
					resultNode = jsonObject.node;
				}
				else
				{
					var found = false;
					for (var j = 0; j < resultNode.children.length; ++j)
					{
						if (resultNode.children[j].node.guid == crumbs[i])
						{
							resultNode = resultNode.children[j].node;
							found = true;
							break;
						}
					}
					if (!found)
						return null;
				}
			}
			return resultNode;
		}

		function createChildrenForNode(layerRootNode)
		{
			var sceneObjects = [];
			for (var i = 0; i < layerRootNode.children.length; ++i)
			{
				var sceneObject;
				var sceneObjectDesc = layerRootNode.children[i].node;
				var geom = null;
				if (sceneObjectDesc.shape)
				{
					geom = createShapeGeom(sceneObjectDesc, sceneObjectDesc.shape);
				}
				else
				{
					geom = THREE.GeometryUtils.clone(sphereGeom);
				}

				if (geom)
				{
					var sceneObject = new THREE.Mesh(
						geom,
						geom.doubleSided ? stageMaterial : seatMaterial
					);
					if (geom.verticesDesc)
					{
						sceneObject.verticesDesc = geom.verticesDesc;
					}
					sceneObject.guid = sceneObjectDesc.guid;
					sceneObject.name = sceneObjectDesc.name;
					var pos = sceneObjectDesc.position;
					sceneObject.position.set(pos.x, pos.y, pos.z);
					sceneObject.originalMaterial = sceneObject.material;
					sceneObjects.push(sceneObject);
				}
				else
				{
					console.log("failed to create geometry for node:");
					console.log(sceneObjectDesc);
				}
			}

			// zero-plane to simplefy user orientation.
			var plane = new THREE.PlaneGeometry(500, 500, 1, 1);
			var planeMesh = new THREE.Mesh(plane, sceneMaterial);
			planeMesh.rotation.set(-Math.PI * 0.5, 0, 0);
			planeMesh.originalMaterial = planeMesh.material;
			sceneObjects.push(planeMesh);

			return sceneObjects;
		}

		function createShapeGeom(objectDesc, shapeDesc)
		{
			var ignoreChildren = false;
			var geom = null;
			if (shapeDesc.radius)
			{
				if (shapeDesc.heightIntervals)
				{
					// cylinder
					geom = new THREE.Geometry();
					for (var i = 0; i < shapeDesc.heightIntervals.length; ++i)
					{
						var height = shapeDesc.heightIntervals[i][1] - shapeDesc.heightIntervals[i][0];
						var singleCylinderGeom = new THREE.CylinderGeometry(shapeDesc.radius, shapeDesc.radius, height, 16, 1, false);
						var mesh = new THREE.Mesh(singleCylinderGeom, seatMaterial);
						mesh.position.y = 0.5 * (shapeDesc.heightIntervals[i][1] + shapeDesc.heightIntervals[i][0]);
						THREE.GeometryUtils.merge(geom, mesh);
					}
				}
				else
				{
					// sphere
					geom =  new THREE.SphereGeometry(shapeDesc.radius, 16, 16);
				}
			}
			else if (shapeDesc.sides)
			{
				// box
				geom = new THREE.CubeGeometry(shapeDesc.sides[0], shapeDesc.sides[1], shapeDesc.sides[2]);
			}
			else if (shapeDesc.vertices)
			{
				// polygone
				var shape = new THREE.Shape(shapeDesc.vertices);

				if (shapeDesc.heightIntervals)
				{
					// 3d polygone
					geom = new THREE.Geometry();
					for (var i = 0; i < shapeDesc.heightIntervals.length; ++i)
					{
						var height = shapeDesc.heightIntervals[i][1] - shapeDesc.heightIntervals[i][0];
						var extrudeSettings = { amount: height }; // bevelSegments: 2, steps: 2 , bevelSegments: 5, bevelSize: 8, bevelThickness:5
						var singleShapeGeom = new THREE.ExtrudeGeometry( shape, extrudeSettings );
						var mesh = new THREE.Mesh(singleShapeGeom, seatMaterial);
						mesh.rotation.x = -Math.PI * 0.5;
						mesh.position.y = shapeDesc.heightIntervals[i][0];
						THREE.GeometryUtils.merge(geom, mesh);
					}
				}
				else
				{
					// flat polygone
					geom = new THREE.Geometry();
					var singleShapeGeom = new THREE.ShapeGeometry( shape );
					var mesh = new THREE.Mesh(singleShapeGeom, stageMaterial);
					mesh.rotation.x = -Math.PI * 0.5;
					THREE.GeometryUtils.merge(geom, mesh);
					geom.doubleSided = true;
				}
				geom.verticesDesc = shapeDesc.vertices;
			}
			else if (shapeDesc.mesh)
			{
				// mesh

				// placeholder
				geom = new THREE.SphereGeometry(shapeDesc.radius, 16, 16);
				ignoreChildren = true;

				// loading model
				var loader = new THREE.JSONLoader();
				var getGeom = function( geometry )
				{
					console.log("Geometry loaded:");
					console.log(geometry);

					var sceneObject = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial());
					sceneObject.guid = objectDesc.guid;
					sceneObject.name = objectDesc.name;
					var pos = objectDesc.position;
					sceneObject.position.set(pos.x, pos.y, pos.z);
					sceneObject.originalMaterial = sceneObject.material;
					subscene.replaceSceneObject(sceneObject);
				};
				loader.load( 'resources/models/' + shapeDesc.mesh, getGeom );
			}

			if (shapeDesc.children)
			{
				if (ignoreChildren)
				{
					console.log("Mesh geometry ignores children.");
				}
				else
				{
					if (!geom)
					{
						geom = new THREE.Geometry();
					}
					for (var i = 0; i < shapeDesc.children.length; ++i)
					{
						var geomChild = createShapeGeom(objectDesc, shapeDesc.children[i].shape);
						if (geomChild)
						{
							THREE.GeometryUtils.merge(geom, geomChild);
						}
					}
				}
			}
			return geom;
		}
	}

	function getPolygoneHelpers(polygone)
	{
		if (!polygone || !polygone.verticesDesc || !polygone.verticesDesc.length)
			return [];
		var helperObject = [];
		for (var i = 0; i < polygone.verticesDesc.length; ++i)
		{
			var geom = THREE.GeometryUtils.clone(helperGeom);
			var sceneObject = new THREE.Mesh(
				geom, helperMaterial
			);
			sceneObject.helperOwner = polygone;
			sceneObject.helperIndex = i;
			sceneObject.guid = 'helper' + i;
			sceneObject.name = 'vertex # ' + i;
			var pos = polygone.verticesDesc[i];
			sceneObject.position.set(
				polygone.position.x + pos.x,
				polygone.position.y,
				polygone.position.z - pos.y
			);
			sceneObject.originalMaterial = sceneObject.material;
			helperObject.push(sceneObject);
		}
		return helperObject;
	}
/*
	function createPointsSector(patternGeom, patternMaterial, stepOffset, widthUnits, depthUnits)
	{
		var centerX = - widthUnits * stepOffset.x / 2;
		var position = {x: centerX, y: 0, z: 0};
		for (var depthUnit = 0; depthUnit < depthUnits; ++depthUnit)
		{
			position.x = centerX;
			for (var widthUnit = 0; widthUnit < widthUnits; ++widthUnit)
			{
				var geom = new THREE.Mesh(THREE.GeometryUtils.clone(patternGeom), patternMaterial);
				geom.position.set(position.x, position.y, position.z);
				geom.name = "seat " + (depthUnit+1) + " x " + (widthUnit+1);
				venueObjects.push( geom );

				position.x = position.x + stepOffset.x;
			}
			position.y = position.y + stepOffset.y;
			position.z = position.z + stepOffset.z;
		}
	}
*/
	function animate()
	{
		requestAnimationFrame(animate);
		render();
		update();

		function render()
		{
			activerenderer.render(scene, camera);
		}

		function update()
		{
			updateContent();
			updateHighlighting();
			updateSelection();
			updateMoving();

			controls.update();
			stats.update();

			function updateContent()
			{
				if (eventsController.objectUpdated)
				{
					eventsController.objectUpdated = false;
					var safeMovingGuid = MOVING ? MOVING.guid : null;
					var safeSelectedGuid = SELECTED ? SELECTED.guid : null;

					subscene.clear();
					var objs = getSpaceLayer(currentSpacePath);
					if (objs)
					{
						subscene.fill(objs);
					}

					var restoreSelected = safeSelectedGuid ? getObjectByGuid(safeSelectedGuid) : null;
					if (restoreSelected)
					{
						setSelectedObject(restoreSelected);
					}
					var restoreMoving = safeMovingGuid ? getHelperByGuid(safeMovingGuid) : null;
					if (restoreMoving)
					{
						MOVING = restoreMoving;
					}
				}

				function getObjectByGuid(guid)
				{
					var len = subscene.sceneObjects.length;
					for (var i = 0; i < len; ++i)
					{
						if (subscene.sceneObjects[i].guid == guid)
							return subscene.sceneObjects[i];
					}
					return null;
				}

				function getHelperByGuid(guid)
				{
					var len = subscene.sceneHelpers.length;
					for (var i = 0; i < len; ++i)
					{
						if (subscene.sceneHelpers[i].guid == guid)
							return subscene.sceneHelpers[i];
					}
					return null;
				}
			}

			function updateHighlighting()
			{
				// INTERSECTED = the object in the scene currently closest to the camera
                //      and intersected by the Ray projected from the mouse position
				var newINTERSECTED = getClosestMouseRayIntersectionSceneObject();
				if (newINTERSECTED && !newINTERSECTED.name)
				{
					// don't accept nameless objects
					newINTERSECTED = null;
				}
				// if there is one (or more) intersections
				if (newINTERSECTED)
				{
					// if the closest object intersected is not the currently stored intersection object
					if (newINTERSECTED != INTERSECTED)
					{
						// restore previous intersection object (if it exists) to its original color
						if (INTERSECTED)
						{
							INTERSECTED.material =
								INTERSECTED == SELECTED ? selectMaterial :
									INTERSECTED.originalMaterial ? INTERSECTED.originalMaterial :
										seatMaterial;
						}
						// store reference to closest object as current intersection object
						INTERSECTED = newINTERSECTED;

						// set highlight via material
						INTERSECTED.material = highlightMaterial;
					}
				}
				else // there are no intersections
				{
					// restore previous intersection object (if it exists) to its original color
					if (INTERSECTED)
					{
							INTERSECTED.material =
								INTERSECTED == SELECTED ? selectMaterial :
									INTERSECTED.originalMaterial ? INTERSECTED.originalMaterial :
										seatMaterial;
					}
					// remove previous intersection object reference
					//     by setting current intersection object to "nothing"
					INTERSECTED = null;
				}
				updateSceneObjectHint(INTERSECTED);

				function getClosestMouseRayIntersectionSceneObject()
				{
					// create a Ray with origin at the mouse position
					//   and direction into the scene (camera direction)
					var vector = new THREE.Vector3(mouse.position.x, mouse.position.y, 1);
					projector.unprojectVector(vector, camera);
					var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());

					// create an array containing all objects in the scene with which the ray intersects
					var intersects = ray.intersectObjects(scene.children);
					if (intersects.length > 0)
						return intersects[0].object;
					return null;
				}

				function updateSceneObjectHint(sceneObject)
				{
					// update text, if it has a "name" field.
					if (sceneObject && sceneObject.name)
					{
						context1.clearRect(0, 0, 640, 480);
						var message1 = sceneObject.name;
						var width = context1.measureText(message1).width;
						var height = 20;
						context1.fillStyle = "rgba(0, 0, 0, 0.95)"; // black border
						context1.fillRect(0, 0, width + 8, height + 8);
						context1.fillStyle = "rgba(255, 255, 255, 0.95)"; // white filler
						context1.fillRect(2, 2, width + 4, height + 4);
						context1.fillStyle = "rgba(0, 0, 0, 1)"; // text color

						context1.fillText(message1, 4, 20);
						texture1.needsUpdate = true;
					}
					else
					{
						context1.clearRect(0, 0, 640, 480);
						texture1.needsUpdate = true;
					}
				}
			}

			function updateSelection()
			{
				if (mouse.pressed("lmb") && MOVINGstate == "none")
				{
					if (!selectionDone)
					{
						setSelectedObject(INTERSECTED);
						selectionDone = true;
					}
				}
				else
				{
					selectionDone = false;
				}
			}

			function updateMoving()
			{
				var movingControl = $('#moving');

				if (mouse.pressed("rmb"))
				{
					MOVING = INTERSECTED;
				}

				if (!MOVING)
				{
					if (movingControl.is(':visible'))
					{
						movingControl.hide();
					}
				}
				else
				{
					if (!movingControl.is(':visible'))
					{
						movingControl.show();
					}
					// update moving control position - link to MOVING object
					var movingScreenPos = PositionSceneToScreen(MOVING.position, camera, $('body'));
					movingControl.offset({top: movingScreenPos.y, left: movingScreenPos.x});
				}

				function PositionSceneToScreen(position, camera, jqdiv)
				{
					var pos = position.clone();
					var projScreenMat = new THREE.Matrix4();
					projScreenMat.multiply(camera.projectionMatrix, camera.matrixWorldInverse);
					projScreenMat.multiplyVector3(pos);
                    return {
                        x: ( pos.x + 1 ) * jqdiv.width() / 2 + jqdiv.offset().left,
                        y: ( - pos.y + 1) * jqdiv.height() / 2 + jqdiv.offset().top
                    };
				}
			}
		}
	}

	function setSelectedObject(sceneObject)
	{
		var resetSelection = false;
		if (SELECTED !== null)
		{
			SELECTED.material = SELECTED.originalMaterial ? SELECTED.originalMaterial : seatMaterial;
			subscene.clearHelpers();
		}
		if (sceneObject !== null)
		{
			SELECTED = sceneObject;
			SELECTED.material = selectMaterial;
			subscene.fillHelpers(getPolygoneHelpers(SELECTED));
			//controls.target.set(SELECTED.position.x, SELECTED.position.y, SELECTED.position.z);

			var newCurrentSpacePath = currentSpacePath + "." + SELECTED.guid;
			var objs = getSpaceLayer(newCurrentSpacePath);
			if (objs && objs.length > 1) // HACK: not 0 because of planeGeometry that adds to every space layer
			{
				currentSpacePath = newCurrentSpacePath;
				subscene.clear();
				subscene.fill(objs);
				focusCameraOnCurrentSpaceLayer();
			}
		}
		else
		{
			resetSelection = true;
		}
		if (resetSelection && SELECTED !== null)
		{
			SELECTED.material = SELECTED.originalMaterial ? SELECTED.originalMaterial : seatMaterial;
			subscene.clearHelpers();
			SELECTED = null;
			//controls.target.set(scene.position.x, scene.position.y, scene.position.z);
		}
	}
}

