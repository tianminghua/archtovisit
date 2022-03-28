// require model and datas
const Campground = require('../models/campground')
const { descriptors, places } = require('./locationHelper')
const cities = require('./cities')
const attractions = require('./attractions')


const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = 'pk.eyJ1IjoidGlhbm1pbmdodWEiLCJhIjoiY2t6YXBpem4xMHc4cjJubGI4a2d6bTR3eiJ9.yxh-hZk2a2-wd1h7pV7fzA';
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

// import mongoose and connect to MongoDB
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb+srv://dez:Gfip6A2a5v2n9tO8@cluster0.1kgts.mongodb.net/attraction?retryWrites=true&w=majority');
    console.log('MONGO CONNECTED')
}

// Helper function to create random title
const randTitle = function (descriptors, places) {
    const d = descriptors[Math.floor(Math.random() * descriptors.length)]
    const p = places[Math.floor(Math.random() * places.length)]
    return `${d} ${p}`
}

const imageURLs = [
    {
        url: 'https://res.cloudinary.com/madsky/image/upload/v1644072367/Sample%20Camp%20Img/photo-1496080174650-637e3f22fa03_wxzhep.avif',
        filename: '1'
    }, {
        url: 'https://res.cloudinary.com/madsky/image/upload/v1644072365/Sample%20Camp%20Img/photo-1475483768296-6163e08872a1_lbfs6c.avif',
        filename: '2'
    }, {
        url: 'https://res.cloudinary.com/madsky/image/upload/v1644072362/Sample%20Camp%20Img/photo-1618526640189-81726d5dd707_jmyzia.avif',
        filename: '3'
    }, {
        url: 'https://res.cloudinary.com/madsky/image/upload/v1644072359/Sample%20Camp%20Img/photo-1530541930197-ff16ac917b0e_bq3tv8.avif',
        filename: '4'
    }, {
        url: 'https://res.cloudinary.com/madsky/image/upload/v1644072355/Sample%20Camp%20Img/photo-1563299796-17596ed6b017_g9mdnk.avif',
        filename: '5'
    }, {
        url: 'https://res.cloudinary.com/madsky/image/upload/v1644072350/Sample%20Camp%20Img/photo-1500581276021-a4bbcd0050c5_xiujus.avif',
        filename: '6'
    }, {
        url: 'https://res.cloudinary.com/madsky/image/upload/v1644072335/Sample%20Camp%20Img/photo-1471115853179-bb1d604434e0_no5coi.avif',
        filename: '7'
    }, {
        url: 'https://res.cloudinary.com/madsky/image/upload/v1644072333/Sample%20Camp%20Img/photo-1504280390367-361c6d9f38f4_tooj1f.avif',
        filename: '8'
    }, {
        url: 'https://res.cloudinary.com/madsky/image/upload/v1644072330/Sample%20Camp%20Img/photo-1478131143081-80f7f84ca84d_x4dp5x.avif',
        filename: '9'
    }, {
        url: 'https://res.cloudinary.com/madsky/image/upload/v1644072326/Sample%20Camp%20Img/photo-1525811902-f2342640856e_vtttug.avif',
        filename: '10'
    }, {
        url: 'https://res.cloudinary.com/madsky/image/upload/v1644072321/Sample%20Camp%20Img/photo-1594495894542-a46cc73e081a_fcfbi5.avif',
        filename: '11'
    }, {
        url: 'https://res.cloudinary.com/madsky/image/upload/v1644072313/Sample%20Camp%20Img/photo-1492648272180-61e45a8d98a7_r4wkex.avif',
        filename: '12'
    }
]

const chooseImgIndex = function () {
    return Math.floor(Math.random() * 12);
}

// Delete all in current DB and import new data seeds
const seedDB = async function () {
    await Campground.deleteMany({});
    for (let i = 0; i < attractions.length; i++) {
        const newCamp = new Campground(attractions[i]);
        await newCamp.save()
    }




    // for (let i = 0; i < 5; i++) {
    //     const rand = Math.floor(Math.random() * 1000);

    //     const location = `${cities[rand].city}, ${cities[rand].state}`
    //     const geoData = await geocoder.forwardGeocode({
    //         query: location,
    //         limit: 1
    //     }).send();
    //     console.log(geoData.body.features[0].geometry)


    //     let imgArray = []
    //     for (let j = 0; j < 3; j++) {
    //         imgArray.push(imageURLs[chooseImgIndex()])
    //     }
    //     const config = {
    //         author: '61fb34b92d0a23bec1817a06',
    //         title: randTitle(descriptors, places),
    //         location: location,
    //         price: Math.floor(Math.random() * 20) * 5,
    //         description: 'Nice Place to Camp',
    //         geometry: geoData.body.features[0].geometry,
    //         images: imgArray
    //     }
    //     console.log(config.geometry)
    //     const newCamp = new Campground(config)
    //     await newCamp.save();
    // }
}

//stop connection with DB after finished
seedDB().then(() => {
    mongoose.connection.close();
})

