import { addTask, createUser, findUser, getAllTasks, getTask, removeTask, updateTask } from "../DataBase/database.js";
import { AccountConnectionError } from "../Errors/AccountConnectionError.js";
import { CreationAccountError } from "../Errors/CreationAccountError.js";

export const middleWare = (req,res,next) => {
    if(req.session.get("user_id")===undefined){
        res.redirect('/log-in');
    }else{
        next()
    }
}

export const showTasks = async (req,res) => {
    let tasks = await getAllTasks(req.session.get("user_id"));
    await res.view("index.ejs",{tasks})
}

export const postTasks = async (req,res) => {
    if(req.body.task!==''){
        await(addTask(req.session.get("user_id"),req.body.task))
    }
    res.redirect("/")
}

export const deleteTask = async (req,res) => {
    await removeTask(req.params.id)
    res.redirect('/')
}

export const showTask = async (req,res) => {
    let [task] = await getTask(req.params.id)
    await res.view("./views/edit",{task})
}

export const postTask = async (req,res) => {
    await updateTask(req.body)
    res.redirect("/")
}

export const listLogin = async (req,res) => {
    req.session.delete();
    await res.view('views/log-in.ejs')
}

export const postLogin = async (req,res) => {
    try{
        let id = await findUser(req.body);    
        req.session.set("user_id",id);
        await res.redirect('/')
    }catch(e){
        if(e instanceof AccountConnectionError){
            console.log("error")
            await res.view('views/log-in.ejs',{message:e.message})
        }
        else
            console.log(e)
    }
    
    
}

export const listSignUp = async (req,res) => {
    await res.view('views/sign-up.ejs')
}

export const postSignUp = async (req,res) => {
    try{
        let id = await createUser(req.body)
        req.session.set("user_id",id);
        res.redirect('/');
    }catch(e){
        console.log('here is the error')
        if(e instanceof CreationAccountError){
            await res.view('views/sign-up.ejs',{message:e.message})
        }else{
            console.log(e)
        }
    }
        
}