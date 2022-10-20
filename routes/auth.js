const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //Create a new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashPassword,
    });

    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/login", async (request, response) => {
  try {
    const user = await User.findOne({ email: request.body.email });
    !user && respose.status(404).json("User not found!");

    const validPassword = await bcrypt.compare(
      request.body.password,
      user.password
    );
    !validPassword && response.status(400).json("Wrong Password");
    response.status(200).json(user);
  } catch(error) {
    response.status(500).json(error);
  }
});

module.exports = router;
