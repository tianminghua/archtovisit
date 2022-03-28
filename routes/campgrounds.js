const express = require('express');
const catchAsync = require('../utils/catchAsync')
const router = express.Router()
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')
const campgrounds = require('../controllers/campgrounds')

const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })


//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CampGround Routing $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.create))


router.get('/new', isLoggedIn, campgrounds.renderNew)

router.route('/:id')
    .get(catchAsync(campgrounds.detail))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.edit))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete))


router.get('/:id/edit', isLoggedIn, catchAsync(campgrounds.renderEdit))

module.exports = router;
