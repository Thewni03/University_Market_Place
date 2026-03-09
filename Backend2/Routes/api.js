import express from 'express';
const router = express.Router();

import {
    getJobPosts,
    getJobPostById,
    createJobPost,
    getServiceRequests,
    createServiceRequest
} from '../Controller/apiController.js';


// JOB POSTS
router.get('/jobposts', getJobPosts);
router.get('/jobposts/:id', getJobPostById);
router.post('/jobposts', createJobPost);


// SERVICE REQUESTS
router.get('/servicerequests', getServiceRequests);
router.post('/servicerequests', createServiceRequest);


export default router;