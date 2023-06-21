const express = require('express');
const router = express.Router();
const { insertVMs,
} = require('../controller/virtual-machine.controller');

router.get('/', insertVMs)


module.exports = router;