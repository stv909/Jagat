var request = require('request')
  , couchapp = require('couchapp')
  , ddoc = {
      _id: '_design/sharejs'
    , views: {
        operations: {
          map: function(doc) {
            if (doc.docName)
              emit([doc.docName, doc.v], {op:doc.op, meta:doc.meta});
          }
        }
      }
    }
  , options = require('./options').db
  , db = options.uri || "http://localhost:5984/sharejs"
  ;

couchapp.createApp(ddoc, db, function(app){
  app.push();
});
