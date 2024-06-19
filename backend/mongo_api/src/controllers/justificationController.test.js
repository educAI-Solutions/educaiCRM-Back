const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const justificationController = require('./justificationController');
const Justification = require('../models/justificationModel');

describe('Justification Controller', function() {
    afterEach(function() {
      sinon.restore();
    });
  
    it('should create a justification and return success', async function() {
      const req = {
        body: {
            student: '66084a13dc6d6b8c3f6974e5',
            classes: ['classes1'],
            fullname: 'fullname1',
            rut: '19732111-2',
            reason: 'reason1',
            startDate: '2024-05-18T00:00:00.000+00:00',
            endDate: '2024-06-18T00:00:00.000+00:00',
            fileExtension: '.pdf',
        }
      };
  
      const res = {
        status: function() { return this; },
        json: function() {}
      };
  
      sinon.stub(Justification, 'create');
      Justification.create.returns(new Justification());
  
      await justificationController.createJustification(req, res);
  
      expect(Justification.create.calledOnce).to.be.true;
    });
});