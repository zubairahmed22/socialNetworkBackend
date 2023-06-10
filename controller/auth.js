import User from "../models/user"
import {hashPassword,compairePassword} from "../Helper/auth"
import jwt from "jsonwebtoken"
import {nanoid}from "nanoid"

export const register = async (req,res) =>{
    // console.log("REGISTER ENDPONT",req.body)
    const {name, email, password, secret } = req.body
    // validation 
    if(!name) {
        return res.json({error:"Name is required"})
    }
    if(!email) {
        return res.json({error:"Email is required"})
    }
    if(!password || password.length < 6){
        return res.json({error:
            "Passowrd is required and should be grater than 6 character"})
    } 
    if (!secret) {
        return res.json({
            error:"Answer is required"
        })
    }
    const exist = await User.findOne({email});
    if(exist){
        return res.json({error:"Email is taken already"})
    }

    /// HashPassword

    const hashedPassword =  await hashPassword(password)
    const user = new User({name, email,password: hashedPassword,
         secret, username:nanoid(6), })
    try {
        await user.save();
        // console.log("REGISTERED USER",user)
        return res.json({
            Ok: true
        })
    } catch (error) {
        console.log("REGISTER FAILD => ", error)
        return res.status(400).send("Error Try Again",error)
    }



}

export const login = async (req, res) =>{
    console.log(req.body)
    
try {
    // check if our db has user with that email 
    const {email, password} = req.body
    const user = await User.findOne({email})
    if(!user) {
        return res.json({
            error:"Not user found"
        });
    }
    // chek password
    const match = await compairePassword(password,user.password)
    if(!match){
        return res.json({
            error:"Worng password"
        })
    }
    // create signed token 
    const token = jwt.sign({_id: user._id},process.env.JWT_SECRET,{
    expiresIn: "7d"})
    user.password = undefined;
    user.secret = undefined;
    res.json({
        token,
        user,
    })

} catch (err) {
    console.log(err)
    return res.json({error:"Error Try Agin"})

}
}



export const currentUser = async (req,res) =>{
    
    try {
        const user = await User.findById(req.user._id)
        res.json({ok: true})
   } catch (err) {
       console.log(err)
       res.sendStatus(400)
   }
}

export const forgotPassword = async (req,res)=>{
//  console.log(req.body)
const {email,Newpassword,secret} = req.body
// validation
if(!email){
    return res.json({
        error:"Email is required"
    })
}
if(!Newpassword || Newpassword < 6){
    return res.json({error:"password is required and should be min 6 characters long"})
}
if(!secret){
    return res.json({
        error:"secret is required"
    })
}

const user = await User.findOne({email,secret})
if(!user){
    return res.json({
        error: "We cant verify you with those details"
    })
}
try{
const hashed = await hashPassword(Newpassword)
await User.findByIdAndUpdate(user._id,{password:hashed})
return res.json({
    success: "Congrate! now you can login with your new password  "
})
}catch(error){

    return res.json({
        error: "Something wrong. Try again"
    })
}
}

export const profileUpdate = async(req,res) =>{

    try {
    //   console.log("profile Update req,body", req.body)  
    const data = {}
    if(req.body.username){
        data.username = req.body.username;
    }
    if(req.body.about){
        data.about = req.body.about
    }
    if(req.body.name){
        data.name = req.body.name
    }
    if(req.body.password){
        if(req.body.password.length < 6){
            return res.json({
                error:"password is required and should be min 6 characters long"
            })
        }else{
            data.password =  await hashPassword(req.body.password)
        }
    }

    if(req.body.secret){
        data.secret = req.body.secret
    }

    
    if(req.body.image){
        data.image = req.body.image
    }



    let user =  await User.findByIdAndUpdate(req.user._id,data,{new: true})
    user.password = undefined
    user.secret = undefined
    res.json(user)

    } catch (error) {
      
        if(error.code == 11000){
            return res.json({ error: "Duplicate username"})
            
        }
        console.log(error)
    }

}

export const findPeople =  async (req,res) =>{
try {
    const user =  await User.findById(req.user._id)
    // user.following 
    let following = user.following
    following.push(user._id)
    const people = await User.find({_id: {$nin: following}}).select('-password -secret')
    .limit(10)
    res.json(people)
} catch (error) {
    console.log(error)
}

}


export const addFollower =  async (req, res,next) =>{
    try {
        const user = await User.findByIdAndUpdate(req.body._id,{
            $addToSet: {followers: req.user._id},
        })
        next()
    } catch (error) {
        
    }

}

export const userFollow = async (req,res) => {
try {

   const  user = await   User.findByIdAndUpdate(req.user._id,{
       $addToSet: {following: req.body._id},
       
   },
   {new: true}
   ).select('-password -secret')
   res.json(user)
    
} catch (error) {
    console.log(error)
}
}

export const userFollowing = async (req, res) =>{

    try{
        const user = await User.findById(req.user._id)
        const following  = await User.find({_id: user.following}).limit(100)
        res.json(following)
    }catch(error){
        console.log(error)
    }
}



export const removeFollower = async (req, res,next) =>{
try {
    const user = await User.findByIdAndUpdate(req.body._id,{
        $pull: {follower: req.user._id}
    })
    next()
} catch (error) {
    console.log(error)
}
}

export const userUnfollow = async (req,res) => {
try {
    const user = await User.findByIdAndUpdate(req.user._id,{
        $pull: {following: req.body._id}
    },{new: true}
    )
    res.json(user)
} catch (error) {
    console.log(error)
}
}