const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const justificationController = require('./justificationController');
const Justification = require('../models/justificationModel');

describe('justificationController', () => {
    describe('getJustifications', () => {
        it('should return all justifications', async () => {
            const req = {};
            const res = {
                status: sinon.stub().returnsThis(),
                json: sinon.stub().returnsThis()
            };

            const justifications = [{ id: 1, text: 'Justification 1' }, { id: 2, text: 'Justification 2' }];
            sinon.stub(Justification, 'find').returns(Promise.resolve(justifications));

            await justificationController.getJustifications(req, res);

            expect(res.status.calledOnce).to.be.true;
            expect(res.status.firstCall.args[0]).to.equal(200);
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.deep.equal(justifications);

            Justification.find.restore();
        });
    });
});
