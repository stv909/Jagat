To setup Frame-Star server from GitHub repository do following:

Single user version (demo01):
	1. console: npm install connect@1.9.2
    2. console: npm install share
	3. Run FrameStar/bin/demos.js

Multi user version (demo02):
	4. install all needed npm modules:
		$ npm install share
		$ npm install request
		$ npm install couchapp
	5. https://jagat.iriscouch.com:6984/_utils/index.html: create db 'frame'
	6. Add in RUN & DEBUG: name(Frame-Star Demos), FilePath(FrameStar/bin/demos.js), CmdLineArgs(<admin/user login> <password>) <- Connect to CouchDB on IrisCouch
	7. Add in RUN & DEBUG: name(Init Scene CouchDB), FilePath(FrameStar/bin/setup_couch_db.js), CmdLineArgs(<admin/user login> <password>) <- Connect to CouchDB on IrisCouch
	8. Run (if db is not created yet): RUN & DEBUG -> Init Scene CouchDB
	9. Run: RUN & DEBUG -> Frame-Star Demos