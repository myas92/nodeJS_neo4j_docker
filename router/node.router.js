const express = require('express');
const router = express.Router();
const { getNodes,
    deleteNodeById
} = require('../controller/node.controller');


router.get('/', getNodes)
router.delete('/:elementId', deleteNodeById)



module.exports = router;