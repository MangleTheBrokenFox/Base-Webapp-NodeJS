//Variables


const port = 8080;


// Dependencies ----------------------------------------


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
 
// Connect to database
mongoose.connect(config.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let db = mongoose.connection;

//Log
db.once('open', () => {console.log('Connected to MongoDB');});
db.on('error', (err) => {console.log(err);});
 
// Init app
const app = express();
 
// Init models
let Article = require('./models/article');
 
// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
 
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
 
// Passport config
require('./config/passport')(passport);


// Midlewares ----------------------------------------
 

//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'pug');
 
// Express Session middleware
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true
}));
 
// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
 

// Routes ----------------------------------------------


app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Home route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if(err){
            console.error(err);
        }else{
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
});

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);


// Handle 404
app.use(function(req, res) {
    res.status(400);
    res.render('errors/404', {
        title: '404: File Not Found'});
});
   
// Handle 500
app.use(function(error, req, res, next) {
    res.status(500);
    res.render('errors/500', {
        title:'500: Internal Server Error', 
        error: error
    });
});

// Server Stuff ----------------------------------------------


//Lance le serveur
app.listen(port, () => {
    console.log('Server started on port ' + port);
});


// Doc ----------------------------------------------
/*
    Cours de base : https://www.youtube.com/watch?v=k_0ZzvHbNBQ&list=PLillGF-RfqbYRpji8t4SxUkMxfowG4Kqp&index=1
    Express validator 5 : https://charlietheprogrammer.com/how-to-use-express-validator-5
    Pug cheetcheat : https://devhints.io/pug
    Pug stuff : https://webdesign.tutsplus.com/tutorials/baking-bootstrap-snippets-with-jade--cms-22798
    Passport DOC : http://www.passportjs.org/docs/
*/