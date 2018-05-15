const Sequelize = require('sequelize');
const dateFormat = require('dateformat');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const db = new Sequelize('nodejs-blog', 'nodejs-blog', 'lolilol123', {
    host: 'h3r0x.ovh',
    dialect: 'mysql'
});

const Post = db.define('post', {
    title: { type: Sequelize.STRING },
    description: { type: Sequelize.STRING },
    content: { type: Sequelize.STRING },
    author: { type: Sequelize.STRING },
    category: { type: Sequelize.STRING }
});

app.set('view engine', 'pug');
app.set("views", "public/views");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    Post.findAll().then((data) => {
        res.render('list', {
            posts: data
        });
    });
});

app.get('/post/:id(\\d+)/', (req, res) => {
    let id = req.params.id;

    Post.findById(id).then(function(data) {
        if(!data) {
            res.redirect('/');
        } else {
            res.render('post', {
                post: data
            });
        }
    });
});

app.get('/post/new', (req, res) => {
    res.render('new');
});

app.post('/post/new', (req, res) => {
    let pTitle = req.body.title;
    let pDescription = req.body.description;
    let pContent = req.body.content;
    let pAuthor = req.body.author;
    let pCategory = req.body.category;

    if(pTitle !== '' && pDescription !== '' && pContent !== '' && pAuthor != '' && pCategory != '') {
        Post
            .sync()
            .then(() => {
                Post.create({
                    title: pTitle,
                    description: pDescription,
                    content: pContent,
                    author: pAuthor,
                    category: pCategory
                }).then((result) => {
                    res.redirect('/post/' + result.id);
                });
            });
    } else {
        res.render('/post/new', {
            error: 'Vous devez compléter tous les champs.'
        });
    }
});

app.listen(3000);
