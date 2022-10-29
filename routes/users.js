const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");

//Update a user
router.put("/:id", async (request, response) => {
  if (request.body.userId === request.params.id || request.body.isAdmin) {
    if (request.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        request.body.password = await bcrypt.hash(request.body.password, salt);
      } catch (error) {
        return response.status(500).json(error);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(request.params.id, {
        $set: request.body,
      });
      response.status(200).json("Account has been updated!");
    } catch (error) {
      return response.status(500).json(error);
    }
  } else {
    return response.status(403).json("You can only update your account!");
  }
});

//Delete a user
router.delete("/:id", async (request, response) => {
  if (request.body.userId === request.params.id || request.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(request.params.id);
      response.status(200).json("Account has been deleted!");
    } catch (error) {
      return response.status(500).json(error);
    }
  } else {
    return response.status(403).json("You can only delete your account!");
  }
});

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Follow a user
router.put("/:id/follow", async (request, response) => {
  if (request.body.userId !== request.params.id) {
    try {
      const user = await User.findById(request.params.id);
      const currentUser = await User.findById(request.body.userId);
      if (!user.followers.includes(request.body.userId)) {
        await user.updateOne({ $push: { followers: request.body.userId } });
        await currentUser.updateOne({
          $push: { followings: request.params.id },
        });
      } else {
        response.status(403).json("You have already followed this user!");
      }
    } catch (error) {
      response.status(500).json(error);
    }
  } else {
    response.status(403).json("Hey, you cannot follow yourself");
  }
});

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

//Get friends
router.get("/friends/:userId", async (request, response) => {
  try {
    const user = await User.findById(request.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    console.log(friends);
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });

    response.status(200).json(friendList);
  } catch (error) {
    response.status(500).json(error);
  }
});

module.exports = router;
