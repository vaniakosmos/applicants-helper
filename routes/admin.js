const express = require('express');
const router = express.Router();

const {isAuth} = require('../controllers/utils');

const controller = require('../controllers/admin/index');

router.get('/', controller.index);

router.get('/login', controller.getLogin);
router.post('/login', controller.postLogin);
router.post('/logout', controller.postLogout);

router.post('/populate', isAuth, controller.populate);
router.post('/update', isAuth, controller.update);
router.post('/dropdatabase', isAuth, controller.drop);

module.exports = router;
