import expressJwt from "express-jwt";
import Post from "../models/post"
export const requiredSigin =expressJwt({
   secret: process.env.JWT_SECRET,
   algorithms: ['HS256'],
})

export const canEditDeletePost = async(req,res, next) =>{
   try {
      const post = await Post.findById(req.params._id);
      // console.log("POST IN EDIT AND DELETE ==>", post)
      if(req.user._id != post.postedBy){
            return res.status(400).send("Unauthroized")
      } else{
         next()
      }
      
   } catch (error) {
      console.log(error)
   }
}