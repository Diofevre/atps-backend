const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PostHashtag = sequelize.define('PostHashtag', {
    post_id: {
        type: DataTypes.INTEGER,
        
    },
    hashtag_id: {
        type: DataTypes.INTEGER,
       
    }
}, {
    tableName: 'post_hashtags',
    timestamps: false, // Pas besoin de createdAt/updatedAt pour une table de relation
});

module.exports = PostHashtag;
