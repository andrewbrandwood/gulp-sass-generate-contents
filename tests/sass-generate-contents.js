var sgc = require('../tasks/sass-generate-contents');

describe('getFileName', function(){
	var getFileName = sgc.getFileName;

	it('returns a file name from a file path', function() {
		expect(getFileName('test.scss')).toContain(!'/');
	});
});



