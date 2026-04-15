import Review from "../models/Review.js";
import Appointment from "../models/Appointment.js";
import mongoose from "mongoose";

// Get all reviews for a psychiatrist
export const getPsychiatristReviews = async (req, res) => {
  try {
    const { psychiatristId } = req.params;
    
    const reviews = await Review.find({ 
      psychiatristId, 
      isVisible: true 
    })
      .populate("userId", "name profilePicture")
      .sort({ createdAt: -1 });
    
    // Calculate average rating
    const ratings = await Review.aggregate([
      { $match: { psychiatristId: new mongoose.Types.ObjectId(psychiatristId), isVisible: true } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
    ]);
    
    res.json({
      reviews,
      averageRating: ratings[0]?.avgRating || 0,
      totalReviews: ratings[0]?.totalReviews || 0
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add a review
export const addReview = async (req, res) => {
  try {
    const { psychiatristId, rating, title, comment } = req.body;
    const userId = req.user._id;
    
    console.log("=== ADD REVIEW DEBUG ===");
    console.log("User ID:", userId);
    console.log("Psychiatrist ID:", psychiatristId);
    console.log("Rating:", rating);
    console.log("Title:", title);
    console.log("Comment:", comment);
    
    // Check if user has had any appointment with this psychiatrist
    const appointments = await Appointment.find({
      psychiatristId,
      userId
    });
    
    console.log("Found appointments:", appointments.length);
    console.log("Appointments:", appointments.map(a => ({ status: a.status, date: a.date })));
    
    // Check if there's any appointment (pending, accepted, or completed)
    if (appointments.length === 0) {
      return res.status(403).json({ 
        message: "You can only review psychiatrists you've had appointments with" 
      });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({ psychiatristId, userId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this psychiatrist" });
    }
    
    // Check if any appointment is accepted or completed
    const hasValidAppointment = appointments.some(a => a.status === "Accepted" || a.status === "Completed");
    
    const review = await Review.create({
      psychiatristId,
      userId,
      rating,
      title,
      comment,
      isVerified: hasValidAppointment, // Only verified if appointment was accepted/completed
      isVisible: true
    });
    
    console.log("Review created successfully:", review._id);
    
    res.status(201).json({ 
      success: true,
      message: "Review submitted successfully!",
      review 
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user._id;
    
    const review = await Review.findOne({ _id: id, userId });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    await review.save();
    
    res.json({ success: true, message: "Review updated successfully", review });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const review = await Review.findOneAndDelete({ _id: id, userId });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name email")
      .populate("psychiatristId", "name email")
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Toggle review visibility
export const toggleReviewVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    review.isVisible = !review.isVisible;
    await review.save();
    
    res.json({ success: true, message: `Review ${review.isVisible ? "visible" : "hidden"} successfully` });
  } catch (error) {
    console.error("Error toggling review visibility:", error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete review
export const adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: error.message });
  }
};