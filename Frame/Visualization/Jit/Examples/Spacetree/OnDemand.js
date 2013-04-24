var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem)
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = '370px';
  }
};

function SpacetreeSelection()
{
	this.unhandledSelection = null;
	this.initial = false;

	this.reset = function()
	{
		this.unhandledSelection = null;
		this.initial = false;
	};

	this.set = function(selection, initial)
	{
		this.unhandledSelection = selection;
		this.initial = initial ? true : false;
	};
}

var st = null;
var spacetreeSelection = new SpacetreeSelection();

function init(infovis, initLevelsToShow, initNodes, getSubtree, callbackSelectedTreeNode, selection)
{
	spacetreeSelection.reset();

	function getTreeNodeByFrameNodyId(frameNodeId)
	{
		// STUB // WARNING: this works only if graph is full expanded.
		for (var treeNode in st.graph.nodes)
		{
			if (st.graph.nodes[treeNode].data.nodeUuid === frameNodeId)
				return treeNode;
		}
		return null;
	}

    //Implement a node rendering function called 'nodeline' that plots a straight line
    //when contracting or expanding a subtree.
    $jit.ST.Plot.NodeTypes.implement({
        'nodeline': {
          'render': function(node, canvas, animating) {
                if(animating === 'expand' || animating === 'contract') {
                  var pos = node.pos.getc(true), nconfig = this.node, data = node.data;
                  var width  = nconfig.width, height = nconfig.height;
                  var algnPos = this.getAlignedPos(pos, width, height);
                  var ctx = canvas.getCtx(), ort = this.config.orientation;
                  ctx.beginPath();
                  if(ort == 'left' || ort == 'right') {
                      ctx.moveTo(algnPos.x, algnPos.y + height / 2);
                      ctx.lineTo(algnPos.x + width, algnPos.y + height / 2);
                  } else {
                      ctx.moveTo(algnPos.x + width / 2, algnPos.y);
                      ctx.lineTo(algnPos.x + width / 2, algnPos.y + height);
                  }
                  ctx.stroke();
              }
          }
        }
    });

    //init Spacetree
    //Create a new ST instance
    st = new $jit.ST({
        'injectInto': infovis,
		//set default orientation
        orientation: 'top',
        //set duration for the animation
        duration: 200,
        //set animation transition type
        transition: $jit.Trans.Quart.easeInOut,
        //set distance between node and its children
        levelDistance: 50,
        //set max levels to show. Useful when used with
        //the request method for requesting trees of specific depth
        levelsToShow: initLevelsToShow,
        //set node and edge styles
        //set overridable=true for styling individual
        //nodes or edges
        Node: {
            height: 40,
            width: 72,
            //use a custom
            //node rendering function
            type: 'nodeline',
            color:'#23A4FF',
            lineWidth: 2,
            align:"center",
            overridable: true
        },

        Edge: {
            type: 'bezier',
            lineWidth: 2,
            color:'#23A4FF',
            overridable: true
        },

        //Add a request method for requesting on-demand json trees.
        //This method gets called when a node
        //is clicked and its subtree has a smaller depth
        //than the one specified by the levelsToShow parameter.
        //In that case a subtree is requested and is added to the dataset.
        //This method is asynchronous, so you can make an Ajax request for that
        //subtree and then handle it to the onComplete callback.
        //Here we just use a client-side tree generator (the getTree function).
        request: function(nodeId, level, onComplete) {
            var ans = getTree(nodeId, level);
            onComplete.onComplete(nodeId, ans);
        },

        onBeforeCompute: function(node){
            Log.write("loading " + node.name);
            if (callbackSelectedTreeNode)
            {
				callbackSelectedTreeNode(node);
            }
        },

        onAfterCompute: function(){
            Log.write("done");

			// handle selection - simple way
			if (spacetreeSelection.unhandledSelection)
			{
				if (spacetreeSelection.initial)
				{
					spacetreeSelection.initial = false;
					st.onClick(st.root);
				}
				else
				{
					var selectedTreeNode = getTreeNodeByFrameNodyId(spacetreeSelection.unhandledSelection);
					spacetreeSelection.unhandledSelection = null;
					if (selectedTreeNode)
					{
						st.onClick(selectedTreeNode);
					}
				}
			}
        },

        //This method is called on DOM label creation.
        //Use this method to add event handlers and styles to
        //your node.
        onCreateLabel: function(label, node){
            label.id = node.id;
            label.innerHTML = node.name;
            label.onclick = function(){
                st.onClick(node.id);
            };
            //set label styles
            var style = label.style;
            style.width = 40 + 'px';
            style.height = 17 + 'px';
            style.cursor = 'pointer';
            style.color = '#fff';
            //style.backgroundColor = '#1a1a1a';
            style.fontSize = '0.8em';
            style.textAlign= 'center';
            style.textDecoration = 'underline';
            style.paddingTop = '3px';
        },

        //This method is called right before plotting
        //a node. It's useful for changing an individual node
        //style properties before plotting it.
        //The data properties prefixed with a dollar
        //sign will override the global node style properties.
        onBeforePlotNode: function(node){
            //add some color to the nodes in the path between the
            //root node and the selected node.
            if (node.selected) {
                node.data.$color = "#ff7";
            }
            else {
                delete node.data.$color;
            }
        },

        //This method is called right before plotting
        //an edge. It's useful for changing an individual edge
        //style properties before plotting it.
        //Edge data proprties prefixed with a dollar sign will
        //override the Edge global style properties.
        onBeforePlotLine: function(adj){
            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
                adj.data.$color = "#eed";
                adj.data.$lineWidth = 3;
            }
            else {
                delete adj.data.$color;
                delete adj.data.$lineWidth;
            }
        }
    });

    //A client-side tree generator
    var getTree = (function() {
        var i = 0;
        return function(treeNodeId, level) {
			var treeNode = st.graph.nodes[treeNodeId];
			var subtree = getSubtree(treeNode ? treeNode.data.nodeUuid : null, level);
			$jit.json.prune(subtree, level); i++;
			return {
				'id': treeNodeId,
				'children': subtree.children
			};
        };
    })();

    //load json data
    st.loadJSON(initNodes);
    //compute node positions and layout
    st.compute();
    //emulate a click on the root node.
	st.onClick(st.root);
	//set selection
	spacetreeSelection.set(selection, true);

    //end
    //Add event handlers to switch spacetree orientation.
    function get(id)
    {
        return document.getElementById(id);
    }

    var top = get('r-top'),
    left = get('r-left'),
    bottom = get('r-bottom'),
    right = get('r-right');

    function changeHandler()
    {
        if (this.checked)
        {
            top.disabled = bottom.disabled = right.disabled = left.disabled = true;
            st.switchPosition(this.value, "animate", {
                onComplete: function()
                {
                    top.disabled = bottom.disabled = right.disabled = left.disabled = false;
                }
            });
        }
    }

    top.onchange = left.onchange = bottom.onchange = right.onchange = changeHandler;
    //end
}
