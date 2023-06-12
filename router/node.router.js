const express = require('express');
const router = express.Router();
const { getNodes,
    deleteNodeById,
    searchNode,
    getNodeWithRelationsById,
    getNodeById
} = require('../controller/node.controller');


router.get('/', getNodes)
router.delete('/:elementId', deleteNodeById)
router.get('/search', searchNode)
router.get('/:elementId/deep/:deepId', getNodeWithRelationsById)
router.get('/:elementId', getNodeById)



module.exports = router;