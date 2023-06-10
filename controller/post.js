import Post from "../models/post"
import User from "../models/user"
import cloudinary  from "cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key:  process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

export const createPost = (req, res) =>{
    console.log("Post =>",req.body)

    const {content,image} = req.body;
    if(!content.length){
    return res.json({
        error: "Content is required"
    })
}
    
    try {
        const post = new Post ({content, image,postedBy: req.user._id})
        post.save()
        res.json(post)
        } catch (err) {
            console.log(err)
            res.sendStatus(400)
        }
        
     

}

export const uploadImage = async (req, res) =>{
// console.log("req files => ", req.files)
try{
    const result = await cloudinary.uploader.upload(req.files.image.path)
    // console.log("uploaded image url =>>",result)
    res.json({
        url: result.secure_url,
        public_id: result.public_id

    })
}catch(err){
console.log(err)
}

}

export const postByUser = async (req, res) => {
try {
    // const posts = await Post.find({postedBy: req.user._id}).populate('postedBy',
    // "_id name image"
    // )

    const posts = await Post.find().populate('postedBy',
    "_id name image"
    )
    .sort({createdAt: -1})
    .limit(10)
    // console.log(posts)
    res.json(posts)
} catch (error) {
   console.log(error) 
}
}

export const userPost = async (req, res) =>{
 try {
     const post = await Post.findById(req.params._id)
     res.json(post)
 } catch (error) {
     console.log(error)
 }
}

export const updatePost = async (req, res) =>{
try{
const update = await Post.findByIdAndUpdate(req.params._id, req.body,{
    new: true,
})
res.json(update)
}catch(error){
    console.log(error)
}
}

export const deletePost = async (req,res) => {
try{
    const deletePost = await Post.findByIdAndDelete(req.params._id);
    if(deletePost.image && deletePost.image.public_id) {
      const image = await cloudinary.uploader.destroy(deletePost.image.public_id)
    }
    res.json({ok: true})
} catch(error){
    console.log(error)
}

}

export const newsFeed  = async (req,res) =>{
try {
    const user = await User.findById(req.user._id)
    let following = user.following;
    following.push(req.user._id)

    const posts = await Post.find({postedBy: {$in: following}})
    .populate('postedBy','_id name image')
    .populate("comments.postedBy","_id name image")
    .sort({createdAt: -1})
    .limit(10)
    res.json(posts)

} catch (error) {
    console.log(error)
}
}


export const likedPost = async(req,res) =>{
    try {
        const  post = await Post.findByIdAndUpdate(req.body._id,{
            $addToSet: {likes: req.user._id}
        },{new: true}) 
        res.json(post)
    } catch (error) {
        console.log(error)
    }
} 

export const UnlikedPost = async (req,res) =>{
    try {
        const  post = await Post.findByIdAndUpdate(req.body._id,{
            $pull: {likes: req.user._id}
        },{new: true}) 
        res.json(post)
    } catch (error) {
        console.log(error)
    }
} 



export const addComment = async (req,res) => {
    try {
        // console.log("comment data ==>",req.body)
        const {postId,comment} = req.body
        const result = await Post.findByIdAndUpdate(postId,{
            $push: {comments: {text: comment,postedBy: req.user._id}}
        },
        {new: true}
        )
        .populate("postedBy","_id name image")
        .populate("comments.postedBy","_id name image")
        res.json(result)
    } catch (error) {
        console.log(error)
    } 
}

export const deleteComment = async (req,res) => {
    try {
        // console.log("comment data ==>",req.body)
        const {postId,comment} = req.body
        const result = await Post.findByIdAndUpdate(postId,{
            $pull: {comments:{_id: comment._id}}
        },
        {new: true})

        res.json(result)
     } catch (error) {
        console.log(error)
    }
}