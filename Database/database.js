import { DataBaseConnectionFailed } from "../Errors/DataBaseConnectionFailed.js";
import {AccountConnectionError} from "../Errors/AccountConnectionError.js"
import { app } from "../server.js";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

import { CreationAccountError } from "../Errors/CreationAccountError.js";

export const getAllTasks = async (id) => {
    const client = await app.pg.connect()
    try {
      const { rows } = await client.query(
        'SELECT * FROM tasks WHERE owner_id=$1;',[id]
      )
      return rows;
    } finally {
      client.release()
    }
}

export const addTask = async (id,taskContent) => {
    const client = await app.pg.connect();
    try {
      const { row } = await client.query(
        'INSERT INTO tasks (id,task,owner_id,completed) VALUES ($1,$2,$3,false);',[nanoid(),taskContent,id]
      )
    } finally {
      client.release()
      
    }
}

export const removeTask = async (id) => {
    const client = await app.pg.connect();
    try {
      const { row } = await client.query(
        'DELETE FROM tasks WHERE id=$1;',[id]
      )
    } finally {
      client.release()
      
    }
}

export const getTask = async (id) => {
  const client = await app.pg.connect()
  try {
    const { rows } = await client.query(
      'SELECT * FROM tasks where id=$1',[id]
    )
    return rows;
  } finally {
    client.release()
  }
}

export const updateTask = async (body) => {
  const client = await app.pg.connect()
  try {
    const { rows } = await client.query(
      'UPDATE tasks SET task=$1,completed=$2 where id=$3',[body.name,!body.completed?false:true,body.id]
    )
    return rows;
  } finally {
    client.release()
  }
}

export const createUser = async ({fullName,email,password}) => {
  const client = await app.pg.connect();
  const saltRounds = 10;
  let id = nanoid();
  if(fullName===""||email===""||password===""){
    throw new CreationAccountError('All fields are required')
  }else if(password.length<6){
    throw new CreationAccountError('Password must be longer than 5 caracters')
  }
  try {
      //console.log(hash.length)
      await bcrypt.hash(password, saltRounds).then(async function(hash) {
        await client.query(
          'INSERT INTO users (user_id,full_name,email,password) VALUES ($1,$2,$3,$4); ',[id,fullName,email,hash]
        )
      });
      return id;
  }catch(e){
    console.log(e)
    console.log('error!!!!!!!!!!!')
    if(e.constraint==='users_pkey'){
      console.log("throwing an error.......")
      throw new CreationAccountError('The email is already used')
    }
    else
      throw new CreationAccountError('undefined error')
  } 
  finally {
    client.release()
    
  }
}

export const findUser = async ({email,password}) => {
  const client = await app.pg.connect()
  try {
    if(email===""||password===""){
      throw new AccountConnectionError('All fiels are required')
    }
    const { rows } = await client.query(
      'SELECT * FROM users WHERE email=$1;',[email]
    )
    // add multiple errors
    // wrong password
    // no user with that email adress etc..
    
    const [user] = rows
    if(user===undefined){
      throw new AccountConnectionError("There is no account with this email")
    }
    const match = await bcrypt.compare(password, user.password);
    if(match){
      return user.user_id;
    }else{
      throw new AccountConnectionError("Email or password is wrong")
    }
  } finally {
    client.release()
  }
}
