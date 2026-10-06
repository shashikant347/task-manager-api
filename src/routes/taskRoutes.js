const router = require('express').Router();
const c = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators/taskValidators');

router.use(protect); // every task route requires a valid JWT

router.route('/')
  .post(v.createTaskRules, validate, c.createTask)
  .get(v.listTaskRules, validate, c.getTasks);

router.route('/:id')
  .get(v.taskIdRule, validate, c.getTask)
  .put(v.updateTaskRules, validate, c.updateTask)
  .delete(v.taskIdRule, validate, c.deleteTask);

module.exports = router;
