import Fastify from "fastify"
import { fileURLToPath } from 'url';
import {fastifyStatic } from "@fastify/static";
import { fastifyView } from "@fastify/view";
import { fastifyPostgres } from "@fastify/postgres";
import { fastifyFormbody } from "@fastify/formbody";
import { fastifySecureSession } from "@fastify/secure-session";
import ejs from "ejs"
import path from "path";
import dotenv from "dotenv";
import { deleteTask, listLogin, listSignUp, middleWare, postLogin, postSignUp, postTask, postTasks, showTask, showTasks } from "./routes/routes_handler.js";

dotenv.config()
export const app = Fastify();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.register(fastifySecureSession, {
    secret: 'averylogphrasebiggerthanthirtytwochars',
  salt: 'mq9hDxBVDbspDR6n',
    cookieName: 'cookie',
    cookie: {
      path: '/'
    }
  })

app.register(fastifyStatic ,{
    root: path.join(__dirname,'public')
})

app.register(fastifyFormbody)

app.register(fastifyView,{
    engine: {
        ejs
    }
})

app.register(fastifyPostgres, {
    connectionString: `postgres://${process.env.BD_USERNAME}:${process.env.BD_PASSWORD}@localhost/postgres`
})


app.get('/',{preHandler:[middleWare]}, showTasks)

app.post('/', postTasks)

app.get('/delete/:id', deleteTask)

app.get('/task/:id', showTask)

app.post('/task/:id', postTask)

app.get('/log-in',listLogin)

app.post('/log-in',postLogin)

app.get('/sign-up',listSignUp)

app.post('/sign-up',postSignUp)

app.listen({port:3000})