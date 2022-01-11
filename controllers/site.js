const express = require('express');
const router = express.Router();
const { Site } = require('../models')

router.get("/", async (request, response) => {
    try {
        const siteArray = await Site.find({});
        response.json({ siteArray });
    }
    catch (error) {
        response.status(500).send(error);
    }
});
//Get Sites that are in the same zipcode, and cities that share that zip code
//Return an object with zip code as key and array of sites in that zipcode as value
router.get("/zip/:zip", async (request, response) => {
    try {
        let zip = request.params.zip;
        let zipResults = {};
        let cityLocationArr = [];
        const siteArray = await Site.find({
            zipCode: zip
        });



        // Creates an array of cities that are in the given zip code based on site input
        for (let i = 0; i < siteArray.length; i++) {
            let city = siteArray[i].city;
            if (!cityLocationArr.includes(city)) {
                cityLocationArr.push(city);
            }
        }

        //Query sites based on the cities
        let citySitesArr = [];
        for (let i = 0; i < cityLocationArr.length; i++) {
            //Oakland, SF
            const citySites = await Site.find({
                city: cityLocationArr[i]
            })
            citySitesArr.push(citySites); //Array of array

        }

        for (let i = 0; i < citySitesArr.length; i++) {
            //the array for each city
            let citySiteArr = citySitesArr[i];
            for (let j = 0; j < citySiteArr.length; j++) {
                let citySite = citySiteArr[j];
            let counterObj = {};
            let waitTimesArr = citySite.waitTimes;
          
            for (let i = 0; i < waitTimesArr.length; i++) {
                let waitTime = waitTimesArr[i].waitTime;

                if (counterObj[waitTime] == undefined) {
                    counterObj[waitTime] = 1;
                }
                else {
                    counterObj[waitTime]++;
                }
            }
           
            const values = Object.values(counterObj);
            const max = Math.max(...values);

            let highestCategoryArr = [];
            for (let waitCategory in counterObj) {
                if (counterObj[waitCategory] == max) {
                    highestCategoryArr.push(waitCategory);
                }
            }

            const sorted = highestCategoryArr.sort();

            let popularWaitTime = highestCategoryArr[highestCategoryArr.length - 1];
            citySite.popularWaitTime = popularWaitTime;
       
      
            }
        }

        //Build object by zip code;
        for (let i = 0; i < citySitesArr.length; i++) {
            //the array for each city
            let citySiteArr = citySitesArr[i];
            for (let j = 0; j < citySiteArr.length; j++) {
                //the individual site
                let citySite = citySiteArr[j];
                let zip = citySite.zipCode;
                if (zipResults[zip] == undefined) {
                    zipResults[zip] = [citySite]

                } else {
                    zipResults[zip].push(citySite);
                }
            }
        }
        let zipObj = {}
        zipObj.closeBy = [];
        for (zipCode in zipResults) {
       
            if (zipCode == zip) {
           
                zipObj[zip] = zipResults[zip];
            }
            else {
                let array = zipResults[zipCode];
           
                for (let i = 0; i < array.length; i++) {
                    let site = array[i];
                    zipObj.closeBy.push(site)
                }
            }


        }
        let zipArr = zipObj[zip];
        let closeByArr = zipObj['closeBy']
       
        response.json({ zipArr, closeByArr });
    }
    catch (error) {
        response.status(500).send(error);
    }
});




// - Individual site page - display all the info including comments 
router.get("/:id", async (request, response) => {
    try {

        let id = request.params.id;

        const site = await Site.find({
            _id: id
        });
        console.log("WAIT TIMES", site[0].waitTimes);
        let counterObj = {};
        let waitTimesArr = site[0].waitTimes
        for (let i = 0; i < waitTimesArr.length; i++) {
            let waitTime = waitTimesArr[i].waitTime;

            if (counterObj[waitTime] == undefined) {
                counterObj[waitTime] = 1;
            }
            else {
                counterObj[waitTime]++;
            }
        }

        const values = Object.values(counterObj);
        const max = Math.max(...values);

        let highestCategoryArr = [];
        for (let waitCategory in counterObj) {
            if (counterObj[waitCategory] == max) {
                highestCategoryArr.push(waitCategory);
            }
        }

        const sorted = highestCategoryArr.sort();

        let popularWaitTime = highestCategoryArr[highestCategoryArr.length - 1];
        console.log("Popular Wait Time", popularWaitTime)

        response.json({ site, popularWaitTime });
    }
    catch (error) {
        response.status(500).send(error);
    }
});

// - New site route 
router.post("/new", async (request, response) => {
    try {
        let waitTimeInput = request.body.waitTimes;
        console.log("HELOOO", waitTimeInput)
        let newSite = await Site.insertMany({
            name: request.body.name,
            address: request.body.address,
            city: request.body.city,
            state: request.body.state,
            zipCode: request.body.zipCode,
            state: request.body.state,
            mondayHours: request.body.mondayHours,
            tuesdayHours: request.body.tuesdayHours,
            wednesdayHours: request.body.wednesdayHours,
            thursdayHours: request.body.thursdayHours,
            fridayHours: request.body.fridayHours,
            saturdayHours: request.body.saturdayHours,
            sundayHours: request.body.sundayHours,
            waitTimes: [{ waitTime: waitTimeInput }]
        })
        console.log("NEW SITE ADDED", newSite)

        console.log("NEW WAIT TIME ADDED", newSite[0].waitTimes)
        response.json({ newSite })
    }
    catch (error) {
        response.status(500).send(error);
    }
});



//take in the site ID and an additional wait time and add to the array
router.put("/updateWaitTime", async (request, response) => {
    let siteId = request.body.siteId;
    let newWaitTime = request.body.waitTimes;
    console.log(siteId);
    console.log("WAIT TIME", newWaitTime);
    try {
        const site = await Site.find({
            _id: siteId
        });

        site[0].waitTimes.push({
            waitTime: newWaitTime
        });

        await site[0].save();
        response.json({ site })
    }
    catch (err) {
        console.log(err)
    }

});


module.exports = router;