To setup Jagat server from GitHub repository do following:

	1. install all needed npm modules:
		$ npm install share
		$ npm install connect-ace
		$ npm install hat
		$ npm install request
		$ npm install couchapp
	2. https://jagat.iriscouch.com:6984/_utils/index.html: create db 'scene'
	3. Add in RUN & DEBUG: name(Jagat), FilePath(JagatServer/bin/jagat.js), CmdLineArgs(<admin/user login> <password>) <- Connect to CouchDB on IrisCouch
	4. Add in RUN & DEBUG: name(Init Scene CouchDB), FilePath(JagatServer/bin/setup_couch_db.js), CmdLineArgs(<admin/user login> <password>) <- Connect to CouchDB on IrisCouch
	5. Run (if db is not created yet): RUN & DEBUG -> Init Scene CouchDB
	6. Run: RUN & DEBUG -> Jagat