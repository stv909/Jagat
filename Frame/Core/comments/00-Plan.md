Tactical plans of Jagat implementation.

	1+ Implement demos of union of these technologies: C9, Direct Text Editor, NodeJS, ShareJS, ThreeJS, Frame.
	2: Implement abstract Frame conception:
		2.1+ Objects conception.
		2.2+ Objects implementation.
		2.3+ Module test suit.
		2.4+ Use simple node-link structure for frame core.
		2.5: SingleUser implementation:
			2.5.1. Think about proper place of tests: SingleUser or Core folder.
			2.5.2: Basic frame views:
				2.5.2.1+ Text.
				2.5.2.2+ Blocks.
				2.5.2.3+ List.
				2.5.2.4: Tree.
					2.5.2.4.1+ Working prototype.
					2.5.2.4.2+ Link aspects representation.
					2.5.2.4.3+ Spawn new Tree View for selected aspect exploring.
					2.5.2.4.4+ Reloading Frame from JSON by button without page refresh.
					2.5.2.4.4. Realtime editing for graph config.
				2.5.2.5. Flow.
			2.5.3: Basic frame editors:
				2.5.3.1: Tree.
					2.5.3.1.1+ Save Frame.
					2.5.3.1.2+ Change node.content.
					2.5.3.1.3+ Add Node.
					2.5.3.1.4+ Add Link.
					2.5.3.1.5+ Add Aspect.
					2.5.3.1.6: Delete Node.
					2.5.3.1.7: Delete Link.
					2.5.3.1.8: Delete Aspect.
					2.5.3.1.9. Search Node by Id.
					2.5.3.1.10. Search Node by Content.
					2.5.3.1.11. View changes in realtime.
				2.5.3.2. Flow.
				2.5.3.3. Text.
				2.5.3.4. Blocks.
		2.6. Explore JIT possibilities, think about new ways of Frame visualization.
		2.7. Formalized as NPM module for iterative self-development.
		2.8. Example application:
			2.8.1. Notes manager.
			2.8.2. IM Client.
			2.8.3. Coding system.
			2.8.4. Content management system.
			2.8.5. 3D Modelling tool.
		2.9. Frame Filter.
		2.10. MultiUser implementation.
			2.10.1. Locking version control system.
			2.10.2. Operational Transformations storage system.
		2.11. Data access management.
	3. Connect Frame with different conceptions:
		3.1. SCM via files and some SCM.
		3.2. DB via some Online DB Provider.
		3.3. OT via ShareJS.

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