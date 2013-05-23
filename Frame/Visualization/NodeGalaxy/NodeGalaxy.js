var NG = NG || {};

NG.Uuid = function()
{
	var c = function() { return 0 };
	function b(a) { return a?(a^c()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b) }
	this.empty = b();

	c = function() { return Math.random() };
	this.generate = b;
};

NG.Node = function(initDesc, initNodeSize, initFont, initColorScheme)
{
	this.id = (new NG.Uuid()).generate();
	this.desc = initDesc|| {uuid: null, name: '?'};
	this.size = initNodeSize || {width: 64, height: 16, depth: 4};
	this.font = initFont || {name: 'helvetiker', size: 6.0};
	this.colorScheme = initColorScheme || {box: 0xFFFFFF, text: 0x000000};

	function create()
	{
		var boxMaterial = new THREE.MeshLambertMaterial(
			{
				color: this.colorScheme.box
			}
		);

		var textMaterial = new THREE.MeshLambertMaterial(
			{
				color: this.colorScheme.text
			}
		);

		var box = new THREE.Mesh(
			new THREE.CubeGeometry(
				this.size.width, this.size.height, this.size.depth,
				1, 1, 1
			),
			boxMaterial
		);

		var textGeom = new THREE.TextGeometry(
			this.desc.name,
			{
				size: this.font.size, // <float> // size of the text
				height: 2.0, // <float> // thickness to extrude text
				curveSegments: 3, // <int> // number of points on the curves

				font: this.font.name, // <string> // font name
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
		text.position.z = this.size.depth;

		box.add(text);
		return box;
	};

	var object3D = create();

	this.getObject3D = function() { return object3D; };
	this.recreateObject3D = function() { object3D = create(); };
};

NG.Link = function(initDesc, initShape, initFont, initColorScheme)
{
	this.id = (new NG.Uuid()).generate();
	this.desc = initDesc|| {uuid: null, name: '?'};
	this.originVertex = initShape ? initShape.origin : null; // THREE.Vector3
	this.targetVertex = initShape ? initShape.target : null; // THREE.Vector3
	this.arrowWidth = initShape ? initShape.arrowWidth : 10;
	this.font = initFont || {name: 'helvetiker', size: 6.0};
	this.colorScheme = initColorScheme || {arrow: 0x00FF00, text: 0x000000};

	function create()
	{
		var arrowMaterial = new THREE.LineBasicMaterial(
			{
				color: this.colorScheme.arrow,
				opacity: 1.0,
				linewidth: 1.0,
				vertexColors: false
			}
		);

		var textMaterial = new THREE.MeshLambertMaterial(
			{
				color: this.colorScheme.text
			}
		);

		var arrowGeom = new THREE.Geometry();
		function constructArrow(lineGeometry, startPoint, endPoint, arrowWidth)
		{
			var arrowDirection = new THREE.Vector3();
			arrowDirection.subVectors(endPoint, startPoint);
			arrowDirection.normalize();
			var subendPoint = new THREE.Vector3(endPoint.x, endPoint.y, endPoint.z);
			var arrowShift = new THREE.Vector3(arrowDirection.x, arrowDirection.y, arrowDirection.z);
			arrowShift.multiplyScalar(arrowWidth);
			subendPoint.sub(arrowShift);
			arrowDirection.applyAxisAngle(new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(90));

			var arrowDotLeft = new THREE.Vector3(arrowDirection.x, arrowDirection.y, arrowDirection.z);
			arrowDotLeft.multiplyScalar(0.5 * arrowWidth);
			arrowDotLeft.add(subendPoint);
			var arrowDotRight = new THREE.Vector3(arrowDirection.x, arrowDirection.y, arrowDirection.z);
			arrowDotRight.multiplyScalar(-0.5 * arrowWidth);
			arrowDotRight.add(subendPoint);

			lineGeometry.vertices = [];
			lineGeometry.vertices.push(startPoint);
			lineGeometry.vertices.push(endPoint);
			lineGeometry.vertices.push(arrowDotLeft);
			lineGeometry.vertices.push(arrowDotRight);
			lineGeometry.vertices.push(endPoint);

			lineGeometry.verticesNeedUpdate = true;
		}

		if (this.originVertex && this.targetVertex)
		{
			constructArrow(arrowGeom, this.originVertex, this.targetVertex, this.arrowWidth);
		}

		var arrow = new THREE.Line(
			arrowGeom,
			arrowMaterial
		);

		var textGeom = new THREE.TextGeometry(
			this.desc.name,
			{
				size: this.font.size, // <float> // size of the text
				height: 2.0, // <float> // thickness to extrude text
				curveSegments: 3, // <int> // number of points on the curves

				font: this.font.name, // <string> // font name
				weight: 'bold', // <string> // font weight (normal, bold)
				style: 'normal', // <string> // font style  (normal, italics)

				bevelEnabled: false, // <bool> // turn on bevel
				bevelThickness: 0.25, // <float> // how deep into text bevel goes
				bevelSize: 0.25 // <float> // how far from text outline is bevel
			}
		);
		textGeom.dynamic = true;
		THREE.GeometryUtils.center(textGeom);
		var text = new THREE.Mesh(textGeom, textMaterial);
		if (this.originVertex && this.targetVertex)
		{
			var center = new THREE.Vector3();
			center.addVectors(this.originVertex, this.targetVertex);
			center.multiplyScalar(0.5);
			text.position = center;
		}

		arrow.add(text);
		return arrow;
	}

	var object3D = create();

	this.getObject3D = function() { return object3D; };
	this.recreateObject3D = function() { object3D = create(); };
};

NG.CameraControl = function(initClientWidth, initClientHeight)
{
	var clientWidth = initClientWidth;
	var clientHeight = initClientHeight;
	var FIELD_OF_VIEW_ANGLE = 45;
	var ASPECT = clientWidth / clientHeight;
	var NEAR = 0.1;
	var FAR = 5000;
	var camera = new THREE.PerspectiveCamera(
		FIELD_OF_VIEW_ANGLE,
		ASPECT,
		NEAR,
		FAR
	);
	camera.position.z = 300;

	var mouseX = 0;
	var mouseY = 0;
	var mouseDown = false;

	document.addEventListener(
		'mousemove',
		function(event)
		{
			mouseX = ( event.clientX / clientWidth ) * 2 - 1;
			mouseY = - ( event.clientY / clientHeight ) * 2 + 1;
			mouseDown = (event.which === 1);
		},
		false
	);
	document.body.addEventListener(
		'mousedown',
		function(event)
		{
			if (event.which === 1)
			{
				mouseDown = true;
			}
		},
		false
	);
	document.body.addEventListener(
		'mouseup',
		function(event)
		{
			if (event.which === 1)
			{
				mouseDown = false;
			}
		},
		false
	);
	document.body.addEventListener(
		'mousewheel',
		function(event)
		{
			camera.position.z += event.wheelDeltaY;
		},
		false
	);

	var mouseXdefault = mouseX;
	var mouseYdefault = mouseY;
	var cameraXdefault = camera.position.x;
	var cameraYdefault = camera.position.y;

	this.animUpdate = function()
	{
		if (!mouseDown)
		{
			mouseXdefault = mouseX;
			mouseYdefault = mouseY;
			cameraXdefault = camera.position.x;
			cameraYdefault = camera.position.y;
		}
		if (mouseDown)
		{
			var Zfactor = -camera.position.z;

			camera.position.y = cameraYdefault + (mouseY - mouseYdefault) *
				(Zfactor * (1 / camera.aspect) * (Math.tan(camera.fov / 2)));
			camera.position.x = cameraXdefault + (mouseX - mouseXdefault) *
				(Zfactor * (Math.tan(camera.fov / 2)));
		}
	};
};

NG.Lights = function()
{
	;
}

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
	var camera = null;
	var scene = null;

	var dragAndZoomCamera = null; // TODO: rename

	var nodes = {};
	var links = {};

	function initialize()
	{
		renderer = new THREE.WebGLRenderer({ antialias: true });
		scene = new THREE.Scene();

		// set the scene size by container size
		var WIDTH = parseInt(this.options.container.style.width, 10);
		var HEIGHT = parseInt(this.options.container.style.height, 10);
		dragAndZoomCamera = NG.CameraControl(WIDTH, HEIGHT);

		scene.add(dragAndZoomCamera.getCamera()); // TODO: implement .getCamera()

		// TODO: new Lights
		// create a point light
		var pointLight = new THREE.PointLight(0xFFFFFF);
		pointLight.position.x = 10;
		pointLight.position.y = 50;
		pointLight.position.z = 130;

		scene.add(pointLight);

		// start the renderer
		renderer.setSize(WIDTH, HEIGHT);

		// attach the render-supplied DOM element
		this.options.container.appendChild(renderer.domElement);
	}

	initialize();
};