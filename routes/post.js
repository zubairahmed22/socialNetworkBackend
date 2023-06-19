const  express =  require("express")
import formidable from "express-formidable"
const router = express.Router();
import {createPost} from "../controller/post"
import {
     uploadImage, postByUser,
    userPost, updatePost,deletePost,
    newsFeed,
    likedPost,
    UnlikedPost,
    deleteComment,
    addComment
} from "../controller/post";
/// middleware
import {requiredSigin,canEditDeletePost 
} from "../middleware"

//Controller 

router.post("/create-post", requiredSigin,createPost)
router.post('/upload-image',requiredSigin,
 formidable({maxfileSize: 5 * 1024 * 1024}),
 uploadImage)
// userPost 
router.get('/user-post',requiredSigin,postByUser)
router.get("/user-post/:_id",requiredSigin, userPost)
router.put('/update-post/:_id',requiredSigin,canEditDeletePost,updatePost)
router.delete('/delete-post/:_id',requiredSigin,canEditDeletePost,deletePost)
router.get('/news-feed',requiredSigin,newsFeed)
router.put('/like-post',requiredSigin, likedPost)
router.put('/unlike-post',requiredSigin, UnlikedPost)
router.put('/add-comment',requiredSigin,addComment)
router.delete('/delete-comment',requiredSigin,deleteComment)



module.exports = router;   