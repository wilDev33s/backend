const express = require("express");
const mysql = require("mysql2");
const myconn = require("express-myconnection");
const cors = require("cors");
const routes = require("./router");

const app = express();

app.set("port", process.env.PORT || 9003);

app.use(express.json());
const dbOptions = {
    host: "bhvtpajnyywelabqwrvc-mysql.services.clever-cloud.com",
    port: 3306,
    user: "ultxi7kkdj0kzepd",
    password: "KgUcdvUoELRhksqxmQC4",
    database: "bhvtpajnyywelabqwrvc",
};

// middlewares -------------------------------------
app.use(myconn(mysql, dbOptions, "single"));
app.use(express.json());
app.use(cors());

//router
app.use("/", routes);

//server
app.listen(app.get("port"), () => {
    console.log("El servidor esta desplegado en el puerto ", app.get("port"));
});

//Mensaje