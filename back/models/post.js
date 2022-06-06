'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    toJSON(){
      return {...this.get(), id: undefined};
    }
  }
  Post.init({
    uid:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    userId:  {
      type: DataTypes.STRING,
      allowNull: false
    },
    content:  {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      defaultValue: 'noimage'
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    dislikes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    usersLiked: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    usersDisliked: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    comments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    topic: {
      type: DataTypes.STRING,
      defaultValue: "notopic"
    }
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};