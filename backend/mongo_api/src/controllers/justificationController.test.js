const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const justificationController = require('./justificationController');
const Justification = require('../models/justificationModel');

describe('Justification Controller', function() {
  afterEach(function() {
    sinon.restore();
  });

  // necesito crear una justificación y retornar un éxito

  it('should create a justification and return success', async function() {
    const req = {
      body: {
        student: '66084a13dc6d6b8c3f6974e5',
        classes: ['6616a0cf384851ae3fd54de4'],
        fullname: 'John Doe',
        rut: '12345678-9',
        reason: 'Sick',
        startDate: new Date(),
        endDate: new Date(),
        fileExtension: 'pdf'
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    const justificationData = req.body;

    // Stub del método create para resolver la promesa
    const createStub = sinon.stub(Justification, 'create').resolves(new Justification(justificationData));

    // Stub del método save para resolver la promesa
    const saveStub = sinon.stub(Justification.prototype, 'save').resolves();

    await justificationController.createJustification(req, res);

    // Verificar que se llamó res.json una vez
    expect(res.json.calledOnce).to.be.true;

    // Verificar que el stub del método create fue llamado con los datos correctos
    expect(createStub.calledOnceWithExactly(justificationData)).to.be.true;

    // Verificar que el stub del método save fue llamado una vez
    expect(saveStub.calledOnce).to.be.true;
  });
  
  

  // necesito actualizar el estado de una justificación y retornar un éxito

  it('should update the state of a justification and return success', async function() {
    const req = {
      params: {
        id: '66084a13dc6d6b8c3f6974e5'
      },
      body: {
        state: 'approved'
      }
    };

    const res = {
      status: function() { return this; },
      json: sinon.spy()
    };

    sinon.stub(Justification, 'findByIdAndUpdate').resolves(req);

    await justificationController.updateJustificationState(req, res);
    expect(res.json.calledOnce).to.be.true;
  });


});