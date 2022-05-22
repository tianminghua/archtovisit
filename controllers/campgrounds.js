const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const cities = [{
    city: 'Seattle',
    location: 'Washington (WA), United States',
    description: 'In Seattle you simply can’t skip the Central Public Library – a modern architectural marvel of glass grids, unusual shapes, and a “book spiral” that climbs four stories. Stroll over to Pike Place Market to visit the original Starbucks and play catch with a fishmonger. In the heart of the city lies Chihuly Garden and Glass, which will dazzle you with its colorful and delicate works. Glide to the top of the Space Needle for panoramic views of the surrounding mountain ranges and Puget Sound.'
}, {
    city: 'Boston',
    location: 'Massachusetts (MA), United States',
    description: "Walk the Freedom Trail the first time you visit Boston and you'll quickly get a sense of this coastal city's revolutionary spirit and history. But make sure you also explore some of Boston's fine museums (try the Isabella Stewart Gardner, featuring masterpieces displayed in their collector's mansion) and old neighborhoods (like the North End, Boston's Little Italy). You can't claim to have experienced real Boston culture, though, until you've watched a Red Sox game from the bleachers."
}, {
    city: 'New York',
    location: 'New York State(NY), United States',
    description: 'The tallest buildings, biggest museums, and best pizza—NYC is a city of superlatives, and it lives up to every one of them. From the dazzling spectacle of Broadway to MoMA’s world-class galleries, the boutiques of SoHo, and the array of restaurants offering cuisines from every corner of the world, there’s a different New York to discover every time you visit. Beyond those iconic landmarks, though, New York’s secret side awaits. You’re likely to stumble upon indie vintage shops and locals-only brunch spots even on the shortest of strolls. And when the crowds and noise are too much to take, just look up—that skyline will remind you why you came in the first place.'
}, {
    city: 'San Francisco',
    location: 'California (CA), United States',
    description: "San Francisco has a personality as big and bold as the Golden Gate Bridge, but that personality changes neighborhood to neighborhood. Consider the tea rooms and mah jong parlors of Chinatown, the lingering hippie chic of Haight-Ashbury, and the boisterous family fun of Ghirardelli Square. The city is also home to one of the country's most dynamic food scenes, from beloved Mission District burrito joints to Michelin-starred dining rooms. When your legs get tired from exploring, hitch a ride on a cable car and take in those hilltop views."
}]



module.exports.index = async (req, res) => {
    let campgrounds;
    if (req.query.city) {
        campgrounds = await Campground.find({ location: req.query.city });
    } else {
        campgrounds = await Campground.find({});
    }
    campgrounds.forEach((campground) => {
        const urls = campground.images[0].url.split('/upload');
        campground.images[0].url = urls[0] + "/upload/c_fill,h_300,w_400" + urls[1];
        campground._doc.circleURL = urls[0] + "/upload/bo_10px_solid_rgb:ffffff,c_thumb,h_200,r_100,w_200" + urls[1];
    })
    let city;
    switch (req.query.city) {
        case 'Seattle':
            city = cities[0];
            break;
        case 'Boston':
            city = cities[1];
            break;
        case 'New York':
            city = cities[2];
            break;
        case 'San Francisco':
            city = cities[3];
            break;
        default:
            city = cities[0];
    }
    //const attractions = { features: JSON.stringify(campgrounds) }
    res.render('campgrounds/index', { campgrounds, city })
}

module.exports.all = async (req, res) => {
    const campgrounds = await Campground.find({});
    campgrounds.forEach((campground) => {
        const urls = campground.images[0].url.split('/upload');
        campground.images[0].url = urls[0] + "/upload/c_fill,h_300,w_400" + urls[1];
    })
    res.render('campgrounds/all', { campgrounds })
}

// https://res.cloudinary.com/madsky/image/upload/v1648006566/attractions/CMoore.DSC00842rt.0_rxnh22.webp
// https://res.cloudinary.com/madsky/image/upload/c_fit,h_300,w_400/v1648006566/attractions/CMoore.DSC00842rt.0_rxnh22.webp


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
    attractions.forEach((campground) => {
        const urls = campground.images[0].url.split('/upload');
        campground.images[0].url = urls[0] + "/upload/c_fill,h_300,w_400" + urls[1];
        campground._doc.circleURL = urls[0] + "/upload/bo_10px_solid_rgb:ffffff,c_thumb,h_200,r_100,w_200" + urls[1];
    })
    res.render('campgrounds/detail', { campground, attractions })
}