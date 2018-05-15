const Sequelize = require('sequelize');
const dateFormat = require('dateformat');
const formidable = require('formidable');
const fs = require('fs');
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
    photo: { type: Sequelize.STRING }
});

app.set('view engine', 'pug');
app.set("views", "public/views");
app.use(express.static("public"));

function showError(res, view, message) {
    res.render(view, {
        error: message
    });
}

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

            Post
                .sync()
                .then(() => {
                    Post.create({
                        title: pTitle,
                        description: pDescription,
                        content: pContent,
                        photo: pPhoto.name
                    }).then((result) => {
                        res.redirect('/post/' + result.id);
                    });
                });
        }
        else
            return showError(res, 'new', 'Vous devez compléter tous les champs.');
    });
});

app.listen(3000);
