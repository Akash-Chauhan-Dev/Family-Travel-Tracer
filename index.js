import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

const db = new pg.Client({
    user : "postgres",
    host : "localhost",
    database : "world",
    password : "codingsky",
    port : "5432"
});

db.connect();

let currentUserId = 1;

let users = [
    {id : 1 , name : 'Akash' , color : 'teal'},
    {id : 2 , name : 'Nicolas' , color : 'green'}
]

async function checkVisited(){
    const result = await db.query("select country_code from visited_countries");
    let countries = [];
    result.rows.forEach(country => countries.push(country.country_code));

    return countries;
}

app.get("/" , async (req , res) => {
    const countries = await checkVisited();
    res.render("index.ejs" , {countries : countries, total : countries.length , users : users , color : 'teal'});
});

app.post("/add" , (req , res) => {
    res.render();
});

app.listen(port , ()=>{
    console.log(`Server running on https://localhost:${port}`);
});