require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
// const fileUpload = require('express-fileupload')
const route = require('./routes/route');
const cors = require('cors'); // Import middleware cors
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'}));
app.use(route);

app.use('/uploads/img', express.static('uploads/img/'));
app.use('/uploads/pdf', express.static('uploads/pdf/'));
app.use('/uploads/doc', express.static('uploads/doc/'));
app.use('/uploads/video', express.static('uploads/video/'));
app.use('/uploads/excel', express.static('uploads/excel/'));
 
app.listen(process.env.PORT, () => {
    console.log('Server Running');
});


// import express from "express";
// import cors from "cors";
// import session from "express-session";
// import dotenv from "dotenv";
// import db from "./config/Database.js";
// import SequelizeStore from "connect-session-sequelize";
// import UserRoute from "./routes/UserRoute.js";
// import ProductRoute from "./routes/ProductRoute.js";
// import AuthRoute from "./routes/AuthRoute.js";
// dotenv.config();

// const app = express();

// const sessionStore = SequelizeStore(session.Store);

// const store = new sessionStore({
//     db: db
// });

// // (async()=>{
// //     await db.sync();
// // })();

// app.use(session({
//     secret: process.env.SESS_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     store: store,
//     cookie: {
//         secure: 'auto'
//     }
// }));

// app.use(cors({
//     credentials: true,
//     origin: 'http://localhost:3000'
// }));
// app.use(express.json());
// app.use(UserRoute);
// app.use(ProductRoute);
// app.use(AuthRoute);

// // store.sync();

// app.listen(process.env.APP_PORT, ()=> {
//     console.log('Server up and running...');
// });