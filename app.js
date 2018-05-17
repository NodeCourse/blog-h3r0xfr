const fs = require('fs');
const dateFormat = require('dateformat');
const formidable = require('formidable');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const express = require('express');
const app = express();

const db = require('./database');
const auth = require('./auth');

app.set('view engine', 'pug');
app.set('views', 'public/views');
app.use(express.static("public"));

app.locals.moment = require('moment');
app.locals.moment.locale('fr');

app.use(cookieParser(auth.secret));
app.use(session({
    secret: auth.secret,
    resave: false,
    saveUninitialized: false
}));

app.use(auth.passport.initialize())
app.use(auth.passport.session());

function render(req, res, view, params) {
    let data = params;

    if(!params)
        data = {};
    if(req.user)
        data.user = req.user;

    res.render(view, data);
}

function showError(res, view, message) {
    render(req, res, 'new', {
        error: message
    });
}

app.get('/', (req, res) => {
    db.Post.findAll({ include: [db.Vote], order: [['createdAt', 'DESC']] }).then((data) => {
        render(req, res, 'list', { posts: data });
    });
});

app.get('/post/:id(\\d+)/', (req, res) => {
    let id = req.params.id;

    db.Post.find({
        where: {id: id},
        include: [db.Vote, db.Comment],
        order: [[db.Comment, 'createdAt', 'DESC']]
    }).then(function(data) {
        if(!data) {
            res.redirect('/');
        } else {
            let votes = {up: 0, down: 0};

            data.votes.forEach(function(element) {
                if(element.action == 'up')
                    votes.up += 1;
                else if(element.action == 'down')
                    votes.down += 1;
            });

            render(req, res, 'post', {
                post: data,
                votes: votes
            });
        }
    });
});

app.get('/post/new', (req, res) => {
    render(req, res, 'new');
});

app.post('/post/new', (req, res) => {
    let form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        let pTitle = fields.title;
        let pDescription = fields.description;
        let pContent = fields.content;
        let pPhoto = files.photo;

        if(pTitle !== '' && pDescription !== '' && pContent !== '' && pPhoto !== '')
        {
            let oldpath = pPhoto.path;
            let newpath = './public/images/uploads/' + pPhoto.name;

            if(!pPhoto.name.match(/\.(jpg|jpeg|png)$/i)) {
                return showError(res, 'new', 'Les extensions acceptées pour la photo sont : jpg, jpeg, png');
            }

            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    console.log(err);
                    return showError(res, 'new', 'Une erreur est survenue lors de l\'envoi du fichier.');
                }
            });

            db.Post.create({
                title: pTitle,
                description: pDescription,
                content: pContent,
                photo: pPhoto.name
            }).then((result) => {
                res.redirect('/post/' + result.id);
            });
        }
        else
            return showError(res, 'new', 'Vous devez compléter tous les champs.');
    });
});

app.get('/post/:id/vote/:action', (req, res) => {
    let id = req.params.id;
    let action = req.params.action;

    if(action == 'up' || action == 'down') {
        db.Vote.create({
            action: action,
            postId: id
        }).then((result) => {
            res.json(result);
        });
    }
});

app.post('/post/:id/comment/add', (req, res) => {
    let id = req.params.id;
    let form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        let cTitle = fields.title;
        let cContent = fields.content;
        let cAuthor = fields.author;

        db.Comment.create({
            title: cTitle,
            content: cContent,
            author: cAuthor,
            postId: id
        }).then((result) => {
            res.json(result);
        });
    });
});

app.get('/login', (req, res) => {
    render(res, res, 'login');
});

app.post('/login', (req, res, next) => {
    let form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {

        req.body = {
            username: fields.username,
            password: fields.password
        };

        auth.passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login'
        })(req, res, next);

    });
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/register', (req, res) => {
    render(req, res, 'register');
})

app.post('/register', (req, res) => {
    let form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        let uFirstname = fields.firstname;
        let uLastname = fields.lastname;
        let uEmail = fields.email;
        let uPassword = fields.password;

        if(uFirstname !== '' && uLastname !== '' && uEmail !== '' && uPassword !== '')
        {
            db.User.create({
                firstname: uFirstname,
                lastname: uLastname,
                email: uEmail,
                password: uPassword
            }).then((result) => {
                res.redirect('/login?newUser');
            });
        }
        else
            return showError(res, 'register', 'Vous devez compléter tous les champs.');
    });
});

app.listen(3000);
