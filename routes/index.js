const express = require('express');
const router = express.Router();

const indexController = require('../controllers/index');
const univController = require('../controllers/univ');
const facultyController = require('../controllers/faculty');
const specController = require('../controllers/spec');
const applicantController = require('../controllers/applicant');
const searchController = require('../controllers/search');


router.get('/', indexController.index);

router.get('/univs', univController.getListOfUnivs);
router.get('/univs/:id', univController.getUniv);

router.get('/faculties/:id', facultyController.getFaculty);

router.get('/specs/:id', specController.getSpec);

router.get('/applicants/:id', applicantController.getApplicant);

router.get('/search', searchController.search);

module.exports = router;
