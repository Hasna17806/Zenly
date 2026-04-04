import SavedPsychiatrists from "../models/SavedPsychiatrists.js";

/* ADD PSYCHIATRIST */
export const addPsychiatrist = async (req, res) => {
  try {

    const exists = await SavedPsychiatrists.findOne({
      userId: req.user._id,
      psychiatristId: req.body.psychiatristId
    });

    if (exists) {
      return res.status(400).json({ message: "Already added" });
    }

    const saved = await SavedPsychiatrists.create({
      userId: req.user._id,
      psychiatristId: req.body.psychiatristId
    });

    res.status(201).json(saved);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};


/* GET USER PSYCHIATRISTS */

export const getMyPsychiatrists = async (req, res) => {
  try {

    const list = await SavedPsychiatrists
      .find({ userId: req.user._id })
      .populate("psychiatristId");

    res.json(list);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


/* REMOVE */

export const removePsychiatrist = async (req, res) => {
  try {
    const deleted = await SavedPsychiatrists.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Saved psychiatrist not found" });
    }

    res.json({ message: "Removed" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};