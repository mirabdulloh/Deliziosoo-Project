import {T}  from "../libs/types/common"
import {NextFunction, Request,Response} from "express"
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enum/member.enum";
import Errors from "../libs/Errors";



const memberService = new MemberService();

const restaurantController : T = {};

restaurantController.goHome = (req:Request,res:Response)=>{
    try{
     console.log("goHome:"); 
     res.render("home")
    }catch(err){
     console.log("ERROR, goHome:", err);
     res.redirect("/admin");
 
    }
 }


 export default restaurantController;