import JobPost from '../Model/JobPost.js';
import ServiceRequest from '../Model/ServiceRequest.js';

export const getJobPosts = async (req, res) => {
    try {
        const jobPosts = await JobPost.find({ status: 'active' }).sort({ createdAt: -1 });
        res.json(jobPosts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getJobPostById = async (req, res) => {
    try {
        const jobPost = await JobPost.findById(req.params.id);

        if (!jobPost) {
            return res.status(404).json({ message: 'Job post not found' });
        }

        res.json(jobPost);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createJobPost = async (req, res) => {

    const jobPost = new JobPost({
        userId: req.body.userId,
        serviceId: req.body.serviceId,
        categoryId: req.body.categoryId,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        deadline: req.body.deadline,
        location: req.body.location
    });

    try {
        const newJobPost = await jobPost.save();
        res.status(201).json(newJobPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const getServiceRequests = async (req, res) => {
    try {
        const serviceRequests = await ServiceRequest.find({ status: 'open' }).sort({ createdAt: -1 });
        res.json(serviceRequests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createServiceRequest = async (req, res) => {

    const serviceRequest = new ServiceRequest({
        userId: req.body.userId,
        categoryId: req.body.categoryId,
        title: req.body.title,
        description: req.body.description,
        budget: req.body.budget,
        deadline: req.body.deadline
    });

    try {
        const newServiceRequest = await serviceRequest.save();
        res.status(201).json(newServiceRequest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};