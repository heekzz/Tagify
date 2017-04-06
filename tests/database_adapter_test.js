//tutorial: https://mochajs.org/
var assert = require('assert');
var db = require('../database_adapter')
describe('MongoDB', function() {
    beforeEach(function(){
        db.init();
    });

    afterEach(function () {
        db.drop();
    });


    describe('addPlaylist()', function() {

        it('should add a playlist to the collection', function() {
            //db.addPlaylist();
            //db.drop();
            assert.equal(db.getPlaylists('hakis'), '12345');
        });
    });
});