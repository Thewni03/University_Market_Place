import CampusQuestion from "../models/CampusQuestion.js";
import CampusAnswer from "../models/CampusAnswer.js";

// -- Questions --

export const getQuestions = async (req, res) => {
  try {
    const { sort, category } = req.query; // sort: 'new', 'top', 'unanswered'
    
    let query = {};
    if (category && category !== "All") {
      query.category = category;
    }

    // Use aggregation to neatly package questions with their answer count
    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "campusanswers",
          localField: "_id",
          foreignField: "questionId",
          as: "answers"
        }
      },
      {
        $addFields: {
          answerCount: { $size: "$answers" },
          upvoteCount: { $size: { $ifNull: ["$upvotes", []] } }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      {
        $project: {
          answers: 0, // don't return all answers, just the count
          "author.password": 0,
          "author.tokens": 0,
          "author.role": 0,
        }
      }
    ];

    if (sort === "unanswered") {
      pipeline.push({ $match: { answerCount: 0 } });
      pipeline.push({ $sort: { createdAt: -1 } });
    } else if (sort === "top") {
      pipeline.push({ $sort: { upvoteCount: -1, createdAt: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } }); // default 'new'
    }

    const questions = await CampusQuestion.aggregate(pipeline);

    return res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getQuestionThread = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await CampusQuestion.findById(id).populate("authorId", "fullname username profile_picture").lean();
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    const answers = await CampusAnswer.find({ questionId: id })
      .populate("authorId", "fullname username profile_picture")
      .sort({ isAccepted: -1, upvotes: -1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { question, answers }
    });
  } catch (error) {
    console.error("Error fetching thread:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const authorId = req.userId;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: "Title, description, and category required" });
    }

    const newQuestion = new CampusQuestion({
      authorId,
      title,
      description,
      category
    });

    await newQuestion.save();
    return res.status(201).json({ success: true, data: newQuestion });
  } catch (error) {
    console.error("Error creating question:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const toggleQuestionUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const question = await CampusQuestion.findById(id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    const index = question.upvotes.indexOf(userId);
    if (index === -1) {
      question.upvotes.push(userId);
    } else {
      question.upvotes.splice(index, 1);
    }
    await question.save();

    return res.status(200).json({ success: true, upvotes: question.upvotes });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -- Answers --

export const postAnswer = async (req, res) => {
  try {
    const { id: questionId } = req.params;
    const { content } = req.body;
    const authorId = req.userId;

    if (!content) return res.status(400).json({ success: false, message: "Answer content required" });

    const question = await CampusQuestion.findById(questionId);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    const newAnswer = new CampusAnswer({
      questionId,
      authorId,
      content
    });

    await newAnswer.save();
    return res.status(201).json({ success: true, data: newAnswer });
  } catch (error) {
    console.error("Error posting answer:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const toggleAnswerUpvote = async (req, res) => {
  try {
    const { answerId } = req.params;
    const userId = req.userId;

    const answer = await CampusAnswer.findById(answerId);
    if (!answer) return res.status(404).json({ success: false, message: "Answer not found" });

    const index = answer.upvotes.indexOf(userId);
    if (index === -1) {
      answer.upvotes.push(userId);
    } else {
      answer.upvotes.splice(index, 1);
    }
    await answer.save();

    return res.status(200).json({ success: true, upvotes: answer.upvotes });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const markAnswerAccepted = async (req, res) => {
  try {
    const { id: questionId, answerId } = req.params;
    const userId = req.userId;

    const question = await CampusQuestion.findById(questionId);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    if (String(question.authorId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Only the question author can accept an answer" });
    }

    const answer = await CampusAnswer.findById(answerId);
    if (!answer || String(answer.questionId) !== String(questionId)) {
      return res.status(404).json({ success: false, message: "Valid answer not found" });
    }

    // Toggle logic: if already accepted, un-accept it
    const newStatus = !answer.isAccepted;
    
    // If accepting, un-accept all other answers for this question first
    if (newStatus) {
      await CampusAnswer.updateMany({ questionId }, { isAccepted: false });
    }

    answer.isAccepted = newStatus;
    await answer.save();

    // Mark question resolved status accordingly
    question.isResolved = newStatus;
    await question.save();

    return res.status(200).json({ success: true, isAccepted: answer.isAccepted, isResolved: question.isResolved });
  } catch (error) {
    console.error("Error accepting answer:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
