'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
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
  Profile.init({
    uid:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    userId:{ 
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    firstname: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: DataTypes.STRING,
    description: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    pictureUrl: { 
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'http://127.0.0.1:3000/images/default/nopic.webp'
    },
    access: { 
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};