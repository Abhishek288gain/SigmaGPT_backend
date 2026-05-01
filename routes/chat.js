import express from "express";
import Thread from "../models/Threads.js";
import mongoose from "mongoose";
const router = express.Router();
import getopenRouterResponse from "../utils/openRouter.js";
import { isLoggedIn } from "../middleware.js";
import passport from "passport";
import { v4 as uuidv4 } from "uuid";

// Get all thread
router.get("/thread", async(req, res) =>{
    
    try{
        //-1 mean sort the thread in decending order on the bases of updatedAt time
        let threads = [];
      
        if (req.isAuthenticated()) {
        // logged-in user → only their threads
            threads = await Thread.find({ owner: req.user._id }).sort({updatedAt: -1});
        } 
       return res.status(200).json(threads);

    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Failed to fetch from DB"});
    }
});

router.get("/thread/:threadId", async(req, res) =>{
    const {threadId} = req.params;
    try{
        const thread = await Thread.findOne({threadId}).populate("owner");

        if(!thread){
            res.status(404).json({error: " Thread is not found"});
        }
        // console.log(thread);

        res.json(thread);//here we send thread.messages beacuses in frontend we only show message of user and assistant

    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Failed to fetch from DB"});
    }
});

router.delete("/thread/:threadId", async(req, res) =>{
    const {threadId} = req.params;
    try{
       const deleteThread = await Thread.findOneAndDelete({ threadId });;
        if(!deleteThread){
            res.status(404).json({error: " Thread not found"});
        }

        res.status(200).json({success :  "Deleted success"});//here we send thread.messages beacuses in frontend we only show message of user and assistant

    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Failed to Delete from DB"});
    }
});

//creating a new chat with msg and reply
  //  // check if user is logged in
        // const isLoggedIn = req.isAuthenticated && req.isAuthenticated();
        //  console.log(req.session);

        // // initialize session counter
        // if (!req.session.chatCount) {
        //     req.session.chatCount = 0;
        // }

        // //  LIMIT FOR UNLOGGED USERS
        // if (!isLoggedIn && req.session.chatCount >= 2) {
        //     return res.status(403).json({
        //         error: "You must login to continue chatting"
        //     });
        // }

router.post("/chat", async(req, res) => {
    const {threadId, message} = req.body;
    // console.log(message);
    if(!threadId || !message){
        return res.status(404).json({error: "Missing required thread !"});
    }  
    try{ 
        let thread = await Thread.findOne({
            threadId,
        });
        // security check
        if (thread && thread.owner && req.user &&
            thread.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        if(!thread){//mean thread is not exist in db
            thread = new Thread({ // so create new thread and save the msg write by user
                threadId,
                title: message,
                owner: req.user?._id || null,
                messages: [{
                    role: "user",
                    content: message
                }],
            });
        } else { // if thread is already exist in db then simply add msg in thread with msg.content
            thread.messages.push({role: "user", content: message});
        }
        const assistantReply = await getopenRouterResponse(message); // fiste send req to openRouter 
        thread.messages.push({role: "assistant", content: assistantReply}); // then save the reply of assistant in DB

        thread.updatedAt = new Date();
        // console.log(thread);
        await thread.save();

        // increment only for unlogged users
        // if (!isLoggedIn) {
        //     req.session.chatCount += 1;
        // }

        res.json({reply: assistantReply});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Failed to write Message"});
    }
});
export default router;