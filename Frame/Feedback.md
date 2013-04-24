2013.04.23 8:00 Jagat.Frame.Editor.Tree.
	Positive:
		1. Path from top abstraction to concrete entity is visible.
	Negative:
		1! The same node could exists in different places of the tree, it's very uncomfortable. Solving: implement Flow view.
		2. Sometimes I need to see entire tree - not only root-current path and some levels of deepness.
		3. Sometimes I lost my data. Working with data is very uncomfortable.
		4. Refreshing of the tree after changes is a too long process. Load/Save are annoying.
		5. When Frame is too long, it can't open new tab for aspect because of too long request.

	Tasks:
		1+ Search and view node in the tree by id.
		2+ Refresh insted of [Save, Load, Find last selected node].
		3: View all links (parent nodes) for current node.
		4. View place in the tree by click on parent node button.
		5. Implement simple aspects list checkbox filtering.
		6. Work with web resource: use link on resource instead of json content - for aspect-tree-open-in-new-tab.
		7. Drag spacetree needed.
		8. Full expand for spacetree needed.
