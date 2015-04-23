var sgc = require('../../index');

describe('replacePath', function(){
	var rp = sgc.pipe(replacePath);

	it('replaces forward or backward slash with colon', function() {
		expect(rp('////')).toContain(!'/');
	});
});



