import express from "express"
const router = express.Router();
import {register,login,
    currentUser,
    forgotPassword,
    profileUpdate,
    findPeople,
    addFollower, userFollow,
    userFollowing,
    userUnfollow,
    removeFollower
} from "../controller/auth"

/// middleware
import {requiredSigin} from "../middleware"

//Controller 
router.post("/register",register)
router.post("/login",login);
router.get("/current-user", requiredSigin,currentUser)
router.post("/forgotpassword",forgotPassword)
router.put('/update-profile',requiredSigin, profileUpdate)
router.get('/find-people',requiredSigin, findPeople)
router.put('/user-follow', requiredSigin,addFollower, userFollow)
router.get('/user-following',requiredSigin,userFollowing)
router.put('/user-unfollow',requiredSigin, removeFollower, userUnfollow)

module.exports = router;   