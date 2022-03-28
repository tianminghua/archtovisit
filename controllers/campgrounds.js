const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })



module.exports.index = async (req, res) => {
    let campgrounds;
    if (req.query.city) {
        campgrounds = await Campground.find({ location: req.query.city });
    } else {
        campgrounds = await Campground.find({});
    }
    const attractions = { features: JSON.stringify(campgrounds) }
    res.render('campgrounds/index', { campgrounds, city: req.query.city })
}

module.exports.renderNew = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.create = async (req, res, next) => {
    const { campground } = req.body;
    const geoData = await geocoder.forwardGeocode({
        query: campground.location,
        limit: 1
    }).send();

    const newCamp = new Campground(campground);
    newCamp.geometry = geoData.body.features[0].geometry
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash('success', 'Successfully made a new campground!!!!!!!!!!!')
    res.redirect(`/campgrounds/${newCamp._id}`)
}

module.exports.edit = async (req, res, next) => {
    const { id } = req.params;
    const { campground } = req.body;
    const camp = await Campground.findByIdAndUpdate(id, { ...campground });
    if (!camp) {
        throw new ExpressError('Campground does not exist!!!!!', 404)
    }
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    camp.images.push(...imgs)
    await camp.save()
    req.flash('success', 'Successfully updated a campground!!!!!!!!!!!')
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.delete = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    if (!camp) {
        throw new ExpressError('Campground does not exist!!!!!', 404)
    }
    req.flash('warning', 'Campground deleted!!!!!!!!!')
    res.redirect('/campgrounds')
}

module.exports.renderEdit = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        throw new ExpressError('Campground does not exist!!!!!', 404)
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.detail = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        throw new ExpressError('Campground does not exist!!!!!', 404)
    }
    const attractions = await Campground.find({ location: campground.location });
    res.render('campgrounds/detail', { campground, attractions })
}