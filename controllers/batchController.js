const Batch = require('../models/Batch');

// Create a new batch
exports.createBatch = async (req, res) => {
  try {
    // `req.body` should include `bundles` array when type==='test_series'
    const batch = await Batch.create(req.body);
    res.status(201).json(batch);
  } catch (err) {
    console.error('Create Batch Error:', err);
    // Send back mongoose validation errors in a friendly format
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    res.status(500).json({ error: 'Failed to create batch' });
  }
};

// Get all batches
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    console.error('Get Batches Error:', err);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
};

// Get single batch by ID
exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    console.error('Get Batch Error:', err);
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
};

// Update batch by ID
exports.updateBatch = async (req, res) => {
  try {
    const updated = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }   // enforce our schema validation on update
    );
    if (!updated) return res.status(404).json({ error: 'Batch not found' });
    res.json(updated);
  } catch (err) {
    console.error('Update Batch Error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    res.status(500).json({ error: 'Failed to update batch' });
  }
};

// Delete batch by ID
exports.deleteBatch = async (req, res) => {
  try {
    const deleted = await Batch.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Batch not found' });
    res.status(204).end();
  } catch (err) {
    console.error('Delete Batch Error:', err);
    res.status(500).json({ error: 'Failed to delete batch' });
  }
};
