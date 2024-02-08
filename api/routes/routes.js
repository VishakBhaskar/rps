const express = require("express");

const router = express.Router();

const Model = require("../model/model");

//Get all Games
router.get("/getAll", async (req, res) => {
  try {
    const data = await Model.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start a new game
router.post("/new-game", async (req, res) => {
  const currentTime = new Date();
  const data = new Model({
    gameAddress: req.body.gameAddress,
    startedBy: req.body.startedBy,
    player2: req.body.player2,
    player1Played: true,
    player2Played: false,
    active: true,
    amount: req.body.amount,
    lastAction: currentTime,
    solved: false,
  });

  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get Games invited to
router.get("/invited/:address", async (req, res) => {
  try {
    const data = await Model.find({ player2: req.params.address });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get games started by me
router.get("/my-games/:address", async (req, res) => {
  try {
    const data = await Model.find({ startedBy: req.params.address });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Player 2 plays
router.post("/play/:address", async (req, res) => {
  const currentTime = new Date();
  const options = { new: true };
  const updateValue = {
    player2Played: true,
    lastAction: currentTime,
  };
  try {
    const updatedData = await Model.findOneAndUpdate(
      {
        gameAddress: req.params.address,
      },
      updateValue,
      options
    );
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Player 1 solves
router.post("/solve/:address", async (req, res) => {
  const currentTime = new Date();
  const options = { new: true };
  const updateValue = {
    active: false,
    lastAction: currentTime,
    solved: true,
  };
  try {
    const updatedData = await Model.findOneAndUpdate(
      {
        gameAddress: req.params.address,
      },
      updateValue,
      options
    );
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Can Player 1 withdraw
router.get("/p1-withdraw/:address", async (req, res) => {
  const currentTime = new Date();
  try {
    const data = await Model.find({ gameAddress: req.params.address });
    const minutesPassed = Math.floor(
      (currentTime - data[0].lastAction) / (1000 * 60)
    );
    if (
      minutesPassed >= 5 &&
      data[0].player2Played == false &&
      data[0].active == true
    ) {
      res.json(true);
    } else {
      res.json(false);
    }

    console.log("Minutes Passed: ", minutesPassed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get game
router.get("/get-game/:address", async (req, res) => {
  try {
    const data = await Model.find({ gameAddress: req.params.address });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Can Player 2 withdraw
router.get("/p2-withdraw/:address", async (req, res) => {
  const currentTime = new Date();
  try {
    const data = await Model.find({ gameAddress: req.params.address });
    const minutesPassed = Math.floor(
      (currentTime - data[0].lastAction) / (1000 * 60)
    );
    if (
      minutesPassed >= 5 &&
      data[0].player1Played == false &&
      data[0].active == true
    ) {
      res.json(true);
    } else {
      res.json(false);
    }

    console.log("Minutes Passed: ", minutesPassed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Player 2 Redeems
router.post("/redeem/:address", async (req, res) => {
  const currentTime = new Date();
  const options = { new: true };
  const updateValue = {
    active: false,
    lastAction: currentTime,
  };
  try {
    const updatedData = await Model.findOneAndUpdate(
      {
        gameAddress: req.params.address,
      },
      updateValue,
      options
    );
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/p1-timeout/:address", async (req, res) => {
  const currentTime = new Date();
  try {
    const data = await Model.find({ gameAddress: req.params.address });
    const minutesPassed = Math.floor(
      (currentTime - data[0].lastAction) / (1000 * 60)
    );
    if (
      minutesPassed >= 5 &&
      data[0].solved == false &&
      data[0].active == true &&
      data[0].player1Played == true
    ) {
      res.json(true);
    } else {
      res.json(false);
    }

    console.log("Minutes Passed: ", minutesPassed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/p2-timeout/:address", async (req, res) => {
  const currentTime = new Date();
  try {
    const data = await Model.find({ gameAddress: req.params.address });
    const minutesPassed = Math.floor(
      (currentTime - data[0].lastAction) / (1000 * 60)
    );
    if (
      minutesPassed >= 5 &&
      data[0].player2Played == false &&
      data[0].active == true &&
      data[0].player1Played == true
    ) {
      res.json(true);
    } else {
      res.json(false);
    }

    console.log("Minutes Passed: ", minutesPassed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
