const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    architect: String,
    address: String,
    year: Number,
    description: String,
    location: String,
    images: [{
        url: String,
        filename: String
    }],
    reviews: [{ type: Schema.Types.ObjectID, ref: 'Review' }],
    author: {
        type: Schema.Types.ObjectID,
        ref: 'User'
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
})

campgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground.reviews.length) {
        await Review.deleteMany({
            _id: {
                $in: campground.reviews
            }
        })
    }
    console.log("Delete!!!!!!!!!!!!!!!!!")
})

const Campground = mongoose.model('Campground', campgroundSchema);
module.exports = Campground;
