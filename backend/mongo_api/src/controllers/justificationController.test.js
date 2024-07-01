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
    const saveStub = sinon.stub(Justification.prototype, 'save').resolves();

    await justificationController.createJustification(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(createStub.calledOnceWithExactly(justificationData)).to.be.true;
    expect(saveStub.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
  });

  it('should handle error when creating a justification', async function() {
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

    const error = new Error('Error creating justification');
    sinon.stub(Justification, 'create').rejects(error);

    await justificationController.createJustification(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ message: 'Error creating justification' })).to.be.true;
  });

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
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    const updateStub = sinon.stub(Justification, 'findByIdAndUpdate').resolves({ ...req.body, _id: req.params.id });

    await justificationController.updateJustificationState(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(updateStub.calledOnceWithExactly(req.params.id, req.body, { new: true })).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('should handle error when updating justification state', async function() {
    const req = {
      params: {
        id: '662badf6490a1c4ae16220d4'
      },
      body: {
        state: 'approved'
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    const error = new Error('Error updating justification state');
    sinon.stub(Justification, 'findByIdAndUpdate').rejects(error);

    await justificationController.updateJustificationState(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ message: 'Error updating justification state' })).to.be.true;
  });

  it('should return all justifications', async function() {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    const justifications = [
      { student: '660c2656a573871eba474449', state: 'approved' },
      { student: '662badf6490a1c4ae16220d4', state: 'pending' }
    ];

    sinon.stub(Justification, 'find').resolves(justifications);

    await justificationController.getAllJustifications(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(justifications)).to.be.true;
  });

  it('should handle error when getting all justifications', async function() {
    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  
    const error = new Error('Error fetching justifications');
    sinon.stub(Justification, 'find').rejects(error);
  
    await justificationController.getAllJustifications(req, res);
  
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ success: false, error: error.message })).to.be.true;
  });

  it('should handle error when getting justifications by student', async function() {
    const req = {
      params: {
        studentId: '66084a13dc6d6b8c3f6974e5'
      }
    };
  
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  
    const error = new Error('Error fetching justifications');
    sinon.stub(Justification, 'find').rejects(error);
  
    await justificationController.getJustificationsByStudent(req, res);
  
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ success: false, error: error.message })).to.be.true;
  });

  it('should handle error when getting justifications by state', async function() {
    const req = {
      params: {
        state: 'approved'
      }
    };
  
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  
    const error = new Error('Error fetching justifications');
    sinon.stub(Justification, 'find').rejects(error);
  
    await justificationController.getJustificationsByState(req, res);
  
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ success: false, error: error.message })).to.be.true;
  });
  
  it('should return 404 when justification not found during update', async function() {
    const req = {
      params: {
        id: '66084a13dc6d6b8c3f6974e5'
      },
      body: {
        state: 'approved'
      }
    };
  
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  
    sinon.stub(Justification, 'findByIdAndUpdate').resolves(null);
  
    await justificationController.updateJustification(req, res);
  
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ success: false, error: 'No justification found' })).to.be.true;
  });
  
  it('should handle error when updating justification', async function() {
    const req = {
      params: {
        id: '66084a13dc6d6b8c3f6974e5'
      },
      body: {
        state: 'approved'
      }
    };
  
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  
    const error = new Error('Error updating justification');
    sinon.stub(Justification, 'findByIdAndUpdate').rejects(error);
  
    await justificationController.updateJustification(req, res);
  
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ success: false, error: error.message })).to.be.true;
  });

  it('should return 404 when justification not found during state update', async function() {
    const req = {
      params: {
        id: '66084a13dc6d6b8c3f6974e5'
      },
      body: {
        state: 'approved'
      }
    };
  
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  
    sinon.stub(Justification, 'findByIdAndUpdate').resolves(null);
  
    await justificationController.updateJustificationState(req, res);
  
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ success: false, error: 'No justification found' })).to.be.true;
  });
  
  it('should handle error when updating justification state', async function() {
    const req = {
      params: {
        id: '66084a13dc6d6b8c3f6974e5'
      },
      body: {
        state: 'approved'
      }
    };
  
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  
    const error = new Error('Error updating justification state');
    sinon.stub(Justification, 'findByIdAndUpdate').rejects(error);
  
    await justificationController.updateJustificationState(req, res);
  
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ success: false, error: error.message })).to.be.true;
  });
  
  it('should return 404 when justification not found during delete', async function() {
    const req = {
      params: {
        id: '66084a13dc6d6b8c3f6974e5'
      }
    };
  
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  
    sinon.stub(Justification, 'findByIdAndDelete').resolves(null);
  
    await justificationController.deleteJustification(req, res);
  
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ success: false, error: 'No justification found' })).to.be.true;
  });
  
  it('should handle error when deleting justification', async function() {
    const req = {
      params: {
        id: '66084a13dc6d6b8c3f6974e5'
      }
    };
  
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  
    const error = new Error('Error deleting justification');
    sinon.stub(Justification, 'findByIdAndDelete').rejects(error);
  
    await justificationController.deleteJustification(req, res);
  
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ success: false, error: error.message })).to.be.true;
  });

  it('should handle error when getting a justification by ID', async function() {
    const req = {
      params: {
        id: '66084a13dc6d6b8c3f6974e5'
      }
    };
  
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  
    const error = new Error('Error fetching justification');
    sinon.stub(Justification, 'findById').rejects(error);
  
    await justificationController.getJustification(req, res);
  
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ success: false, error: error.message })).to.be.true;
  });
  
  
  it('should return 400 when required field is missing in createJustification', async function() {
    const req = {
      body: {
        // 'student' is missing here
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
  
    await justificationController.createJustification(req, res);
  
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({
      success: false,
      error: 'Required field is missing'
    })).to.be.true;
  });

  it('should delete a justification and return success', async function() {
    const req = {
      params: {
        id: '662badf6490a1c4ae16220d4'
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    const deleteStub = sinon.stub(Justification, 'findByIdAndDelete').resolves({ _id: req.params.id });

    await justificationController.deleteJustification(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'Justification deleted successfully' })).to.be.true;
    expect(deleteStub.calledOnceWithExactly(req.params.id)).to.be.true;
  });

  it('should handle error when deleting a justification', async function() {
    const req = {
      params: {
        id: '66084a13dc6d6b8c3f6974e5'
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    const error = new Error('Error deleting justification');
    sinon.stub(Justification, 'findByIdAndDelete').rejects(error);

    await justificationController.deleteJustification(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ message: 'Error deleting justification' })).to.be.true;
  });

  it('should handle invalid ID error when updating justification', async function() {
    const req = {
      params: {
        id: 'invalid-id'
      },
      body: {
        state: 'approved'
      }
    };
  
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  
    const error = new Error('Invalid ID');
    sinon.stub(Justification, 'findByIdAndUpdate').rejects(error);
  
    await justificationController.updateJustification(req, res);
  
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({
      success: false,
      error: 'Invalid ID'
    })).to.be.true;
  });
  
});
