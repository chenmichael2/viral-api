const express = require('express');
const router = express.Router();
const { Review } = require('../models')

router.get("/:siteId", async (request, response) => {
    console.log('review backend connected')
   
    try {
        let allReviewArr = await Review.find({
            site: request.params.siteId
        })
        console.log("ALL REVIEW", allReviewArr);

        response.json({allReviewArr});

    }
    catch (error) {
        response.status(500).send(error);
    }

});

router.post("/new/", async (request, response) => {
    console.log('review backend connected')
   
    try {
        let newReview = await Review.insertMany({
            review: request.body.review,
            createdDate: request.body.createdDate,
            upVotes: request.body.upVotes,
            userName: request.body.nameOfUser,
            user: request.body.userId,
            site: request.body.siteId,
        })
        console.log("NEW REVIEW", newReview);

        response.json({newReview});

    }
    catch (error) {
        response.status(500).send(error);
    }

});

module.exports = router;