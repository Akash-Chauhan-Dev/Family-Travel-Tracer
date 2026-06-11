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

async function checkVisited(){
    const result = await db.query("select country_code from visited_countries where user_id = $1" , [currentUserId]);
    let countries = [];
    result.rows.forEach(country => countries.push(country.country_code));
    return countries;
}

async function checkUsers(){
    const raw_users = await db.query("select * from users");
    // let users = [];
    // raw_users.rows.forEach(user => users.push(user));
    const users = raw_users.rows;
    // console.log(users);

    return users;
}

app.get("/" , async (req , res) => {
    const users = await checkUsers();
    const countries = await checkVisited();
    res.render("index.ejs" , {countries : countries, total : countries.length , users : users , color : users[currentUserId-1].color});
});

app.post("/add" , async (req , res) => {
    const country = req.body.country.toLowerCase().trim();
    // console.log(country);

    try{
        const raw_code = await db.query("select country_code from countries where lower(country_name) like $1 || '%';" , [country]);
        const country_code = raw_code.rows[0].country_code;
        // console.log(country_code);
        
        try{
            await db.query("insert into visited_countries(country_code , user_id) values($1 , $2);" , [country_code , currentUserId]); 
            // console.log(currentUserId);  
            res.redirect("/");
        }catch(error){
            console.log(error);
            const users = await checkUsers();
            const countries = await checkVisited();
            res.render("index.ejs" , {countries : countries , total : countries.length , users : users , color : users[currentUserId-1].color , error : 'Country has already been added , please try another name!'});
        }
    }catch(error){
        console.log(error);
        const users = await checkUsers();
        const countries = await checkVisited();
        res.render("index.ejs" , {countries : countries , total : countries.length , users : users , color : users[currentUserId-1].color , error : "Country doesn't exist , please enter correct name!"});
    }
});

app.post("/user" , async (req , res) => {
    if(req.body.add){
        res.render("new.ejs");
    }
    else{
        currentUserId = req.body.user;
        res.redirect("/");
    }
});

app.post("/new" , async (req , res) => {

    if(req.body.cancel){
        res.redirect("/");
    }
    else{
        const user_name = req.body.userName;
        const user_color = req.body.userColor;
        const users = await checkUsers();
        const len = users.length;
        
        // users.push({id : len+1 , name : user_name , color : user_color});
        await db.query("insert into users(id , name , color) values($1 , $2 , $3);", [len+1 ,user_name , user_color]);
        res.redirect("/");
    }
});

app.listen(port , ()=>{
    console.log(`Server running on https://localhost:${port}`);
});
