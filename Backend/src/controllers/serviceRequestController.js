import ServiceRequest from '../models/serviceRequest.js';
import { notify } from '../notifications/notification.service.js';

// Create a new Service Request
export const createServiceRequest = async (req, res) => {
    try {
        const newRequest = new ServiceRequest(req.body);
        const savedRequest = await newRequest.save();

        // NOTIFY: The person who owns the service/is receiving the request
        // Assuming your model has 'serviceOwnerId' or 'providerId'
        if (savedRequest.providerId) {
            await notify({
                userId: savedRequest.providerId,
                type: 'service_request_received',
                title: 'New Service Request',
                body: `You have a new request for your service from ${req.user?.fullname || 'a user'}.`,
                metadata: { requestId: savedRequest._id, url: '/dashboard/requests' }
            });
        }

        res.status(201).json(savedRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a Service Request (Used for Accepting/Rejecting)
export const updateServiceRequest = async (req, res) => {
    try {
        const oldRequest = await ServiceRequest.findById(req.params.id);
        const updatedRequest = await ServiceRequest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: 'Service Request not found' });
        }

        // NOTIFY: The requester when the status changes (e.g., Pending -> Accepted)
        if (oldRequest.status !== updatedRequest.status) {
            await notify({
                userId: updatedRequest.userId, // The person who originally asked for the service
                type: 'service_request_update',
                title: 'Service Request Update',
                body: `Your service request status has been updated to: ${updatedRequest.status}.`,
                metadata: { requestId: updatedRequest._id, url: '/my-requests' }
            });
        }

        res.status(200).json(updatedRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all Service Requests
export const getAllServiceRequests = async (req, res) => {
    try {
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
