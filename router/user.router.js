const express = require('express');
const router = express.Router();
const { getUsers, insertUser, deleteAllUsers, createRelation, getUsersByLabel, searchUser, getUsersWithRelations, getRelations } = require('../controller/user.controller');

router.get('/users/label', getUsersByLabel)
router.get('/users/relation', getUsersWithRelations)
router.post('/users/relation', createRelation)
router.get('/users/search', searchUser)
router.post('/users', insertUser)
router.get('/users', getUsers)
router.delete('/users', deleteAllUsers)
router.get('/relations', getRelations)


module.exports = router;