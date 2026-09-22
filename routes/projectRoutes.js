const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getProjects);
router.post('/', protect, upload.single('logo'), createProject);
router.put('/:id', protect, upload.single('logo'), updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
