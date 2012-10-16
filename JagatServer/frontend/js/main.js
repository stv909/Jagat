function main()
{
	// SubScene object
	var SubScene = function(parentScene)
	{
		this.sceneObjects = [];
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
		for (var i = 0; i < this.sceneObjects.length; ++i)
		{
			this.scene.remove(this.sceneObjects[i]);
		}
		this.sceneObjects = [];
		MOVING = null;
		SELECTED = null;
		INTERSECTED = null;
	};

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

	EventsController.prototype.elementChanged = function(guid, newPosition)
	{
		if (this.onChange)
		{
			this.onChange({"action" : "positionUpdate", "guid": guid, "position": newPosition});
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
			var posStartEnd = getPositionInterval(eventsController, change.guid);
			if (!posStartEnd)
			{
				console.error("Can not update object changed in 3d:");
				console.error(change);
				return;
			}
			switch (change.action)
			{
				case 'positionUpdate':
					// apply changes for local text cache
					var text = eventsController.getData();
					var newText = 
						text.substring(0, posStartEnd.start) + 
						getJsonPosition(change.position) + 
						text.substring(posStartEnd.end + 1);
					eventsController.setData(newText);
					// apply changes for OT
					doc.del(posStartEnd.start, posStartEnd.end - posStartEnd.start + 1);
					doc.insert(posStartEnd.start, getJsonPosition(change.position));
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
			function getJsonPosition(position)
			{
				return '"position": ' + JSON.stringify(position).replace(/:/g, ': ').replace(/,/g, ', ');
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
	var sphereGeom, sceneMaterial, seatMaterial, highlightMaterial, selectMaterial;
	var 
        INTERSECTED = null, 
        SELECTED = null, 
        selectionDone = false, 
        MOVING = null, 
        MOVINGstate = "none", 
        MOVINGcontroloffset = {x: 0, y: 0};
	var canvas1, context1;
	var sprite1, texture1;
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
		$('#yMove').mousedown(onMovingYMouseDown);
		$('#xzMove').mousedown(onMovingXZMouseDown);
		
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
			renderer = new THREE.WebGLRenderer({antialias: true});
			renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
			container = document.createElement('div');
			document.body.appendChild(container);
			container.appendChild(renderer.domElement);
			// EVENTS
			THREEx.WindowResize(renderer, camera);
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
			sceneMaterial = new THREE.MeshBasicMaterial({color: 0xff00aa, transparent: true, opacity: 1.0});
			seatMaterial = new THREE.MeshBasicMaterial({color: 0xeeee00, transparent: true, opacity: 0.5});
			highlightMaterial = new THREE.MeshBasicMaterial({color: 0x0000ee, transparent: true, opacity: 0.75});
			selectMaterial = new THREE.MeshBasicMaterial({color: 0x00ee00, transparent: true, opacity: 0.25});
			
			// SUBSCENE
			subscene = new SubScene(scene);
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
					var planeMesh = new THREE.Mesh(plane, null);
					planeMesh.position.set(0, MOVING.position.y, 0);
					planeMesh.doubleSided = true;
					planeMesh.updateMatrix();
					planeMesh.updateMatrixWorld();
					// find intersection of ray and plane
					var intersects = ray.intersectObjects([planeMesh]);
					if (intersects.length > 0)
					{
						MOVING.position = intersects[0].point;
						MOVING.updated = true;
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
					eventsController.elementChanged(MOVING.guid, MOVING.position);
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
		
	function getSpaceLayer(path)
	{
		var layerRootNode = getNodeByPath(eventsController.getObject(), path);
		if (!layerRootNode)
			return null;
        
		camera.position.set(-300, 500, -800);
		camera.lookAt(scene.position);	
        
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
				var sceneObjectDesc = layerRootNode.children[i].node;
				var sceneObject = new THREE.Mesh(THREE.GeometryUtils.clone(sphereGeom), seatMaterial);
				sceneObject.guid = sceneObjectDesc.guid;
				sceneObject.name = sceneObjectDesc.name;
				var pos = sceneObjectDesc.position;
				sceneObject.position.set(pos.x, pos.y, pos.z);
				sceneObjects.push(sceneObject);
			}
			var plane = new THREE.PlaneGeometry(500, 500, 1, 1);
			sceneMaterial = new THREE.MeshBasicMaterial({color: 0x888888, transparent: true, opacity: 1.0});
			var planeMesh = new THREE.Mesh(plane, sceneMaterial);
			planeMesh.doubleSided = true;
			sceneObjects.push(planeMesh);
			
			return sceneObjects;			
		}
	}
/*		
	function getSubSceneObjects(name)
	{
		if (name == "city")
			return getCityObjects();
		else if (name == "interior01")
			return getVenueObjects(1);
		else if (name == "interior02")
			return getVenueObjects(2);
		else if (name == "interior03")
			return getVenueObjects(3);
		else
			return null;
		
		function getCityObjects()
		{
			camera.position.set(-300, 500, -800);
			camera.lookAt(scene.position);	
		
			var venues = new Array();
			venue01 = new THREE.Mesh(THREE.GeometryUtils.clone(sphereGeom), seatMaterial);
			venue01.position.set(-120, -15, 170);
			venue01.name = "venue 01";
			venue01.command = "goto interior01";
			venues.push(venue01);
			
			venue02 = new THREE.Mesh(THREE.GeometryUtils.clone(sphereGeom), seatMaterial);
			venue02.position.set(230, 60, -70);
			venue02.name = "venue 02";
			venue02.command = "goto interior02";
			venues.push(venue02);
			
			venue03 = new THREE.Mesh(THREE.GeometryUtils.clone(sphereGeom), seatMaterial);
			venue03.position.set(-120, -40, -230);
			venue03.name = "venue 03";
			venue03.command = "goto interior03";
			venues.push(venue03);
			
			return venues;
		}
			
		function getVenueObjects(idObj)
		{
			var venueObjects = new Array();
			var planeGeometry = null;
			
			if (idObj == 1)
			{
				camera.position.set(-300, 500, -800);
				camera.lookAt(scene.position);	
			
				sceneMaterial = new THREE.MeshBasicMaterial({color: 0xeeff00, transparent: true, opacity: 1.0});
			
				var stepOffset = {x: 100, y: 80, z:120};
				createPointsSector(sphereGeom, seatMaterial, stepOffset, 10, 3);
			
				planeGeometry = new THREE.PlaneGeometry(400, 160, 1, 1);
			}
			else if (idObj == 2)
			{
				camera.position.set(-700, 800, -1500);
				camera.lookAt(scene.position);	
			
				sceneMaterial = new THREE.MeshBasicMaterial({color: 0xffaa00, transparent: true, opacity: 1.0});
			
				var stepOffset = {x: 100, y: 80, z:120};
				createPointsSector(sphereGeom, seatMaterial, stepOffset, 15, 2);
			
				planeGeometry = new THREE.PlaneGeometry(400, 160, 1, 1);
			}
			else if (idObj == 3)
			{
				camera.position.set(-900, 750, -1700);
				camera.lookAt(scene.position);	
			
				sceneMaterial = new THREE.MeshBasicMaterial({color: 0xff00aa, transparent: true, opacity: 1.0});
			
				var stepOffset = {x: 100, y: 80, z:120};
				createPointsSector(sphereGeom, seatMaterial, stepOffset, 8, 6);
			
				planeGeometry = new THREE.PlaneGeometry(400, 160, 1, 1);
			}
	
			if (!planeGeometry)
			{
				planeGeometry = new THREE.PlaneGeometry(400, 160, 1, 1);			
			}
			var plane = new THREE.Mesh(planeGeometry, sceneMaterial);
			plane.position.set(-50, 10, -250);
			plane.doubleSided = true;
			plane.name = "action scene";
			plane.command = "goto city";
			venueObjects.push(plane);
			
			return venueObjects;
			
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
			renderer.render(scene, camera);
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
					subscene.clear();
					var objs = getSpaceLayer(currentSpacePath);
					if (objs)
					{
						subscene.fill(objs);
					}
					var restoreMoving = safeMovingGuid ? getObjectByGuid(safeMovingGuid) : null;
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
							INTERSECTED.material = INTERSECTED == SELECTED ? selectMaterial : seatMaterial;
						}
						// store reference to closest object as current intersection object
						INTERSECTED = newINTERSECTED;
					}
				} 
				else // there are no intersections
				{
					// restore previous intersection object (if it exists) to its original color
					if (INTERSECTED)
					{
						INTERSECTED.material = INTERSECTED == SELECTED ? selectMaterial : seatMaterial;
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
						// set a new color for closest object
						sceneObject.material = highlightMaterial;
                        
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
				
				function setSelectedObject(sceneObject)
				{
					var resetSelection = false;
					if (SELECTED !== null)
					{
						SELECTED.material = seatMaterial;				
					}
					if (sceneObject !== null)
					{
						SELECTED = sceneObject;
						SELECTED.material = selectMaterial;
						//controls.target.set(SELECTED.position.x, SELECTED.position.y, SELECTED.position.z);
						
						var newCurrentSpacePath = currentSpacePath + "." + SELECTED.guid;
						var objs = getSpaceLayer(newCurrentSpacePath);
						if (objs)
						{
							currentSpacePath = newCurrentSpacePath;
							subscene.clear();
							subscene.fill(objs);
						}
					}
					else
					{
						resetSelection = true;
					}
					if (resetSelection && SELECTED !== null)
					{
						SELECTED.material = seatMaterial;
						SELECTED = null;
						//controls.target.set(scene.position.x, scene.position.y, scene.position.z);
					}
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
}

