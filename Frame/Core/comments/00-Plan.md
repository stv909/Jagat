Tactical plans of Jagat implementation.

	1+ Implement demos of union of these technologies: C9, Direct Text Editor, NodeJS, ShareJS, ThreeJS, Frame.
	2: Implement abstract Frame conception:
		2.1+ Objects conception.
		2.2+ Objects implementation.
		2.3+ Module test suit.
		2.4+ Use simple node-link structure for frame core.
		2.5. SingleUser implementation:
			2.5.1. Think about proper place of tests: SingleUser or Core folder.
			2.5.2. Basic frame views:
				2.5.2.1+ Text.
				2.5.2.2+ Blocks.
				2.5.2.3+ List.
				2.5.2.4. Tree.
					2.5.2.4.1+ Working prototype.
					2.5.2.4.2+ Link aspects representation.
					2.5.2.4.3+ Spawn new Tree View for selected aspect exploring.
					2.5.2.4.4+ Reloading Frame from JSON by button without page refresh.
!					2.5.2.4.5. Basic NodeGalaxy implementation.
!					2.5.2.4.6. Autoposition nodes.
!					2.5.2.4.7. Search Node by Content.
!					2.5.2.4.8. Realtime editing for graph config.
!				2.5.2.5+ FlowSegment.
!				2.5.2.6. Flow.
!					2.5.2.6.1. Basic NodeGalaxy implementation.
!					2.5.2.6.2. Autoposition nodes.
!				2.5.2.7. Graph.
!					2.5.2.7.1+ Basic NodeGalaxy implementation.
!					2.5.2.7.2. Autoposition nodes.
!				2.5.2.8. Combiner.
!					2.5.2.8.1. Basic NodeGalaxy implementation (Tree, Flow, Graph).
!					2.5.2.8.2. Open implementation (add custom view algorithms).
!				2.5.2.8: Multiview.
			2.5.3. Basic frame editors:
				2.5.3.1. Tree.
					2.5.3.1.1+ Save Frame.
					2.5.3.1.2+ Change node.content.
					2.5.3.1.3+ Add Node.
					2.5.3.1.4+ Add Link.
					2.5.3.1.5+ Add Aspect.
					2.5.3.1.6+ Delete Node.
					2.5.3.1.7+ Delete Link.
					2.5.3.1.8+ Delete Aspect.
					2.5.3.1.9+ Search Node by Id.
						2.5.3.1.9.1+ Fix problem with searching for deep trees.
						2.5.3.1.9.2+ Fix problem with lags for levelsToShow >> 2 (04Tree.SpacetreeDataGenerator.expand.for_cycle).
						2.5.3.1.9.4+ Try to simplify onClick actions in spacetree needed for selection.
						2.5.3.1.9.5+ Fix broken inirial selection fia html request parameter 'selection'.
						2.5.3.1.9.6+ Make search univocal for treeNode - give both parentId and searchNodeId.
					2.5.3.1.10+ Spacetree refresh by one click.
					2.5.3.1.11. List of aspects.
					2.5.3.1.12. Turn aspects view on/off.
					2.5.3.1.11. View changes in realtime.
!				2.5.3.2. Graph.
		2.6. Formalized as NPM module for Iterative self-development.
!			2.6.1: Describe Jagat via Frame.
!			2.6.2. Formalize Jagat as NPM module.
!		2.7. Explore JIT possibilities, think about new ways of Frame visualization.
		2.8. Frame Filter.
			2.8.1. Filter frame by list of aspects (turned on/off).
		2.9. MultiUser implementation.
			2.9.1. Locking version control system.
			2.9.2. Operational Transformations storage system.
		2.10. Data access management.
	3. Example applications:
!		3.1. Notes & Links manager (like Pearltree).
		3.2. IM Client.
		3.3. Coding system.
		3.4. Content management system.
		3.5. 3D Modelling tool.
!		3.6. Animating tool.
!	3. Connect Frame with different conceptions:
!		3.1. SCM via files and some SCM.
!		3.2. DB via some Online DB Provider.
!		3.3. OT via ShareJS.

System Needs.

	1. Flexible overlinkable storage of any type of documentation: notes, links, books, articles, legals etc.
	2. Different points of view for the same information structure.
	3. Easy filtering and searching.
	4. Easy restructuring/refactoring.
	5. Clear visual representation of information structure with all links and topology.
	6. Code system integrated with documentation, tests, feedback.
	7. Content system integrated with code, documentation, tests, feedback.
	8. Close integration of all parts for project management.
	9. Online collaboration: turn-based <-> real-time.
	10. Cloud hosting and storage.
	11. Access from wide range of devices without complex infrastructure.
	12. Abstract modeling system (entities - links).
	13. Flexible data access management.
	14. Facebook-like Massive Entity Web.
	15. Social Network integration.