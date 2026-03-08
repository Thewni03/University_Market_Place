import ServiceRequest from '../models/serviceRequest.js';

// Create a new Service Request
export const createServiceRequest = async (req, res) => {
    try {
        const newRequest = new ServiceRequest(req.body);
        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all Service Requests
export const getAllServiceRequests = async (req, res) => {
    try {
        // Optionally populate userId to get user details
        const requests = await ServiceRequest.find().sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single Service Request by ID
export const getServiceRequestById = async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Service Request not found' });
        }
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a Service Request
export const updateServiceRequest = async (req, res) => {
    try {
        const updatedRequest = await ServiceRequest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedRequest) {
            return res.status(404).json({ message: 'Service Request not found' });
        }
        res.status(200).json(updatedRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a Service Request
export const deleteServiceRequest = async (req, res) => {
    try {
        const result = await ServiceRequest.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Service Request not found' });
        }
        res.status(200).json({ message: 'Service Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
