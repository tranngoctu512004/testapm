var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const apm = require('elastic-apm-node');

// Định nghĩa mô hình cho MongoDB
const Schema = mongoose.Schema;
const TestSchema = new Schema({
  name: String,
  value: Number
});
const TestModel = mongoose.model('Test', TestSchema);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET test transaction. */
router.get('/test-transaction', function (req, res, next) {
  const transaction = apm.startTransaction('test-transaction', 'custom');

  // Simulate some work
  setTimeout(() => {
    transaction.end();
    res.send('Test transaction completed!');
  }, 1000);
});

/* GET test error. */
router.get('/test-error', function (req, res, next) {
  console.log("tesst logs")
  try {
    throw new Error('This is a test error');
  } catch (error) {
    apm.captureError(error);
    next(error);
  }
});

/* GET test async. */
router.get('/test-async', async function (req, res, next) {
  const transaction = apm.startTransaction('test-async', 'custom');

  // Giả lập công việc không đồng bộ
  await new Promise(resolve => setTimeout(resolve, 1000));

  transaction.end();
  res.send('Test async transaction completed!');
});

/* GET test dependency. */
router.get('/test-dependency', function (req, res, next) {
  const transaction = apm.startTransaction('test-dependency', 'custom');

  // Simulate an external dependency
  const span = transaction.startSpan('external-dependency', 'custom');
  setTimeout(() => {
    span.end();
    transaction.end();
    res.send('Test dependency completed!');
  }, 500);
});

/* POST test create. */
router.post('/test-create', async function (req, res, next) {
  const transaction = apm.startTransaction('test-create', 'database');

  try {
    const doc = new TestModel({ name: 'Sample', value: Math.random() });
    await doc.save();
    transaction.end();
    res.send('Test create completed!');
  } catch (error) {
    apm.captureError(error);
    next(error);
  }
});
router.post('/orders', (req, res, next) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    const orderData = req.body;
    if (!orderData.customerName || !orderData.items || orderData.items.length === 0) {
      throw new Error('Dữ liệu đơn hàng không hợp lệ');
    }

    // ... Xử lý đơn hàng (nếu dữ liệu hợp lệ) ...
    res.status(201).json({ message: 'Đơn hàng đã được tạo' });
  } catch (error) {
    next(error); // Gửi lỗi cho middleware xử lý lỗi
  }
});

router.get('/test-read', async function (req, res, next) {
  apm.logger.info('Test log message');
  const transaction = apm.startTransaction('test-read', 'database');
  try {
    const docs = await TestModel.find({});
    transaction.end();
    res.json(docs);
  } catch (error) {
    apm.captureError(error);
    next(error);
  }
});

/* DELETE test delete. */
router.delete('/test-delete/:id', async function (req, res, next) {
  const transaction = apm.startTransaction('test-delete', 'database');

  try {
    await TestModel.findByIdAndDelete(req.params.id);
    transaction.end();
    res.send('Test delete completed!');
  } catch (error) {
    apm.captureError(error);
    next(error);
  }
});

module.exports = router;



