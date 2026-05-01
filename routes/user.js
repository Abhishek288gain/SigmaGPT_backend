import express from "express";
const router = express.Router();
import User from "../models/User.js";
import passport from "passport";
import { isLoggedIn } from "../middleware.js";

router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ user: req.user });
  } 
  return res.status(401).json({ message: "Not logged in" });
});


router.get("/user", async (req, res) => {
  try{
    const allUser = await User.find({});
    
    res.json(allUser);

  } catch (err) {
    console.log("fail to fetch : ", err);
  }
});

router.put("/user/update", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const { username, displayName } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        username,
        displayName 
      },
      { new: true }
    );

    res.status(201).json({
      message: "Profile Edit successfully",
      user: updatedUser
    });

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

router.delete("/deleteUser", async (req, res) => {
  try{
    const allUser = await User.deleteMany({});
    
    res.status(202).json({message: "all user deleted ", allUser});

  } catch (err) {
    console.log("fail to fetch : ", err);
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const newUser = new User({ email, username });

    const registeredUser = await User.register(newUser, password); // register() given by passport user for signup user.
    // console.log(registeredUser);
    req.login(registeredUser, (err) => { //req.login is used. if we want to login automatically after signup and store user ingo in req.user property
    
      if (err){ 
        alert("A user with the given Information is already registered!")
        next(err)
      };

      res.status(201).json({
        message: "User registered successfully",
        user: registeredUser
      });
    });
    
  } catch (err) {

    return res.status(500).json({
      message: err.message
    });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    //  now authenticate using username internally
    passport.authenticate("local", (err, authUser, info) => {
      if (err) return next(err);

      if (!authUser) {
        return res.status(401).json({
          message: "Wrong password"
        });
      }

      req.logIn(authUser, (err) => {
        if (err) return next(err);

        return res.json({
          message: "Login successful",
          user: authUser
        });
      });

    })(
      { ...req, body: { username: user.username, password } }, res, next
    );
  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
});

router.get("/logout", (req, res) => { // req.logout() remove the curInfo of user from session
  req.logout((err) => { // but user still the member of website . user just simply login again for explore website
    if (err) return res.status(500).json(err);

    res.json({ message: "Logout successful" });
  });
});

export default router;
