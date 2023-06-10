const express = require('express');
const router = express.Router();
const { getProjects,
    insertProject,
    getProjectsByLabel,
    getProjectsWithRelations,
} = require('../controller/project.controller');

router.get('/label', getProjectsByLabel)
router.get('/relation', getProjectsWithRelations)
router.post('/', insertProject)
router.get('/', getProjects)



module.exports = router;