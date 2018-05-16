const Sequelize = require('sequelize');

// Connection
const db = new Sequelize('nodejs-blog', 'nodejs-blog', 'lolilol123', {
    host: 'h3r0x.ovh',
    dialect: 'mysql'
});

// Models
const postModel = db.define('post', {
    title: { type: Sequelize.STRING },
    description: { type: Sequelize.STRING },
    content: { type: Sequelize.STRING },
    photo: { type: Sequelize.STRING }
});

const voteModel = db.define('vote', {
    action: { type: Sequelize.ENUM('up', 'down') }
});

const commentModel = db.define('comment', {
    title: { type: Sequelize.STRING },
    content: { type: Sequelize.STRING },
    author: { type: Sequelize.STRING }
});

const userModel = db.define('user', {
    firstname: { type: Sequelize.STRING },
    lastname: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING }
});

// Relations
postModel.hasMany(voteModel);
postModel.hasMany(commentModel);

voteModel.belongsTo(postModel);
commentModel.belongsTo(postModel);

// Synchronization
db.sync();

// Export
module.exports = {
    Post: postModel,
    Vote: voteModel,
    Comment: commentModel,
    User: userModel
};
