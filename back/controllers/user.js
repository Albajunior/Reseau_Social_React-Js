const {Sequelize,sequelize, User, Profile, Comment, Post} = require('../models/');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Op = Sequelize.Op;

getAuthorizedAdminIps = () =>{
  let str = ""+String(process.env.AUTHORIZED_ADMIN_IPS)+"";
  let tab = [];
  let s = "";
  let j = 0;
  for(let i = 0; i < str.length; i++){
    if(str.charAt(i) === ';'){
      tab[j] = s;
      s = "";
      j++;
    }else{
    s += str.charAt(i); 
    }
  }
  return tab;
}

async function createUser(body,hash,access){
  const userCreated = await User.create({...body,
    password: hash,
    access: access
  });
  return userCreated;
}

async function createProfile(body,user){
  const profileCreated = await Profile.create({...body,
    userId: user.uid,
    access: user.access
  });  
  return profileCreated;
}


exports.login = (req,res) =>{
  if (!req.body.email || !req.body.password) {
    return res.status(400).send(new Error('Bad request!'));
  }
  User.findOne({where:{ email: req.body.email }}).then(user =>{
    bcrypt.compare(req.body.password, user.password)
      .then(valid => {
        if (!valid) {
          return res.status(401).json({ error: 'Mot de passe incorrect !' });
        }
        res.status(200).json({
          userId: user.uid,
          token: jwt.sign(
            { userId: user.uid },
            process.env.JSON_TOKEN,
            { expiresIn: '24h' }
          )    
        });
      })
      .catch(error => res.status(500).json({ error }));
    })
    .catch(err =>{
      res.status(404).json({message: 'Utilisateur non trouvé !', error : err})
    });
};

exports.register = (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.firstname) {
    return res.status(400).send(new Error('Bad request!'));
  }
    //Utilisation de Bcrypt pour hasher le mot de passe
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    let access = "user";

    if(req.body.superPassword){
      console.log("Admin creation request from "+req.ip);
      const authip = getAuthorizedAdminIps();
      let ok = false;
      for(let i = 0; i < authip.length; i++){
        if(authip[i] === req.ip){
          ok = true;
        }
      }

      if (process.env.SUPER_PASS === req.body.superPassword && ok) {
        access = "admin";
      }
      else {
        return res.status(401).json({message: "Unauthorized !"});
      }
    }
      createUser(req.body,hash,access).then((userCreated)=>{
        createProfile(req.body,userCreated).then((profileCreated)=>{
          res.status(201).json({ message: 'Utilisateur et profil créés !'});
        })
      .catch(err =>{
        res.status(500).json({ message: 'Erreur lors de la création du profil !', error: err});
      });
    })
      .catch(err =>{
        res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur !', error: err});
      })
  })
  .catch((err) => res.status(500).json({ message: 'Erreur lors du hashage du mot de passe !', error: err}));
}

exports.editUserEmail = (req, res) =>{
  if (!req.body.newEmail) {
    return res.status(400).send(new Error('Bad request!'));
  }
    User.findOne({where:{uid : res.locals.userId}})
    .then((userEditing)=>{
      User.findOne({where:{uid : req.params.id}})
      .then((user) =>{
        if(userEditing.access !== "admin" && String(user.uid) !== res.locals.userId){
          return res.status(403).json({message: "Forbidden !"});
        }
        let UserModified = {
          email : req.body.newEmail,
          password : user.password,
          access : user.access,
        };
        User.update({...UserModified} ,{where:{uid : user.uid}})
          .then(() => res.status(200).json({ message: 'Utilisateur modifié !'}))
          .catch(() => res.status(400).json({ message: 'Erreur lors de la modification de l\'utilisateur !' }));
      })
      .catch(() => res.status(404).json({message: 'Not found !'}));
    })
    .catch(() => res.status(404).json({message: 'Not found !'}));
}

exports.editUserPassword = (req, res) =>{
  if (!req.body.oldPassword && !req.body.newPassword) {
    return res.status(400).send(new Error('Bad request!'));
  }

    User.findOne({where:{uid : res.locals.userId}})
    .then((userEditing)=>{
      User.findOne({where:{uid : req.params.id}})
      .then((user) =>{
        if(userEditing.access !== "admin" && String(user.uid) !== res.locals.userId){
          return res.status(403).json({message: "Forbidden !"});
        }
          bcrypt.compare(req.body.oldPassword, user.password)
          .then(valid => {
            if (userEditing.access !== "admin" && !valid) {
              return res.status(403).json({ message: 'Mot de passe incorrect !' });
            }

          bcrypt.hash(req.body.newPassword,10)
          .then((hash)=>{
          let UserModified = {
            email : user.email,
            password : hash,
            access : user.access,
          };
          User.update({...UserModified} ,{where:{uid : user.uid}})
            .then(() => res.status(200).json({ message: 'Utilisateur modifié !'}))
            .catch(() => res.status(500).json({ message: 'Erreur lors de la modification de l\'utilisateur !' }));
          })

        })
        .catch(() => res.status(500).json({ message: 'Erreur lors du hashage du mot de passe !' }));
      })
      .catch(() => res.status(404).json({message: 'Not found !'}));
    })
    .catch(() => res.status(404).json({message: 'Not found !'}));
};

exports.deleteUser = (req, res) =>{

    User.findOne({where:{uid : res.locals.userId}})
    .then((userDeleting)=>{
      User.findOne({where:{uid : String(req.params.id)}})
      .then((user) =>{
        if(userDeleting.access !== "admin" && String(user.uid) !== res.locals.userId){
          return res.status(403).json({message: "Forbidden !"});
        }
        if(String(user.uid) === res.locals.userId){
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
              if (!valid) {
                return res.status(403).json({ error: 'Mot de passe incorrect !' });
              }
            })
          .catch(error => res.status(500).json({ error, message: "test" }));
        }
        User.destroy({where:{uid : String(req.params.id)}})
        .then(() => {
            Profile.destroy({where:{userId: String(req.params.id)}})
            .then(() => {
              res.status(200).json({ message: 'Profil supprimé !'});
              Post.destroy({where:{userId: req.params.id}}).then(()=>{
                console.log("Posts from "+req.params.id+" deleted !");
                Comment.destroy({where:{userId: req.params.id}}).then(()=>{
                  console.log("Comments from "+req.params.id+" deleted !");
                });
              });
            })
            .catch(() => res.status(301).json({ message: 'Erreur lors de la deletion du profil !'}));
        })
        .catch(() => res.status(500).json({ message: 'Erreur lors de la deletion de l\'utilisateur !' }));
      })
      .catch(() => res.status(404).json({message: 'User not found !'}));
    })
    .catch(() => res.status(404).json({message: 'Not found !'}));
};

exports.getOneUser = (req, res) => {

    User.findOne({where:{uid : res.locals.userId}})
    .then((userRequesting)=>{
      User.findOne({where:{ uid: req.params.id }})
      .then(user => {
        if(userRequesting.access === "admin" || String(user.uid) === res.locals.userId){
          User.findOne({where:{ uid: req.params.id }})
          .then(user => res.status(200).json(user))
          .catch(error => res.status(404).json({ error }));
        }
        else{
          return res.status(403).json({message: "Forbidden !"});
        }
      })
      .catch(() => res.status(404).json({message: 'Not found !'}));
    })
    .catch(() => res.status(404).json({message: 'Not found !'}));
};

//ADMIN
exports.getAllUsers = async (req,res) =>{

    User.findOne({where:{ uid: res.locals.userId }})
    .then(user => {
      if(user.access === "admin"){
        User.findAll()
        .then(Users => res.status(200).json(Users))
        .catch(error => res.status(400).json({ error }));
      }
      else{
        return res.status(403).json({message: "Forbidden !"});
      }
    });
};

exports.getOneProfile = (req, res) =>{

  Profile.findOne({where:{userId : req.params.id}})
  .then((ProfileFound) => {
    res.status(200).json(ProfileFound)
  })
  .catch(() => res.status(404).json({message: 'Not found !'}));
}

exports.getAllProfiles = (req,res) =>{

  Profile.findAll()
  .then(Profiles => res.status(200).json(Profiles))
  .catch(error => res.status(400).json({ error }));
};

exports.searchProfiles = (req, res) =>{

  if(!req.body.profiles){
    return res.status(400).send(new Error('Bad request!'));
  }

  const profilesSearch = req.body.profiles;

  Profile.findAll()
  .then((profiles) => {
    let profilesFound = {};
      for(let j = 0; j < profilesSearch.length; j++){
        for(let i = 0; i < profiles.length; i++){

        if(String(profilesSearch[j]) === String(profiles[i].userId)){
          profilesFound[profiles[i].userId] = profiles[i];
        }
      }
    }
    res.status(200).json(profilesFound);

  })
  .catch((e) => res.status(404).json({message: 'Not found !', error: e}));
}

exports.textSearchProfile = (req, res) =>{

  if(!req.body.query){
    return res.status(400).send(new Error('Bad request!'));
  }

  const q = String(req.body.query);
  let str = "";
  let queries = [];
  for(let i = 0; i < q.length; i++){
    if(q.charAt(i) === ' '){
      queries.push(str);
      str = "";
    }
    else{
      str += q.charAt(i);
    }
  }

  if(queries.length === 0){
    queries[0] = q;
    queries[1] = q;
  }

  Profile.findAll({
    where: {
      [Op.or]:{
        firstname: {
          [Op.iLike]: '%' + queries[0] + '%'
        },
        lastname: {
          [Op.iLike]: '%' + queries[1] + '%'
        }
      }
    },
    limit: 10
  })
  .then((profiles) => {
    res.status(200).json(profiles);

  })
  .catch((e) => res.status(404).json({message: 'Not found !', error: e}));
}

exports.editProfile = (req, res) =>{

  if((!req.body.firstname &&
    !req.body.lastname &&
    !req.body.description &&
    !req.file) && !req.body.profile){
    return res.status(400).send(new Error('Bad request!'));
  }
  let ProfileModified;

  Profile.findOne({where:{userId : req.params.id}})
  .then((ProfileFound) => {
    User.findOne({where:{uid : res.locals.userId}})
    .then((UserFound) => {
      if(ProfileFound.userId !== String(UserFound.uid) && UserFound.access !== "admin"){
        return res.status(403).json({message: 'Forbidden !'})
      }

      if(req.body.profile){
        ProfileModified = JSON.parse(req.body.profile);
      }
      else{
        ProfileModified = {
          "firstname" : ProfileFound.firstname,
          "lastname" : ProfileFound.lastname,
          "description" : ProfileFound.description,
          "pictureUrl" : ProfileFound.pictureUrl,
          "userId" : ProfileFound.userId,
          "access" : ProfileFound.access,
        };

        if(req.body.firstname){
          ProfileModified.firstname = req.body.firstname;
        }
        if(req.body.lastname){
          ProfileModified.lastname = req.body.lastname;
        }
        if(req.body.description){
          ProfileModified.description = req.body.description;
        }
      }

      if(req.file){
        if(ProfileFound.pictureUrl !== 'http://127.0.0.1:3000/images/default/nopic.webp'){
          if (fs.existsSync('./images/' + ProfileFound.pictureUrl.split('/images/')[1])) {
            console.log('Deleting : ./images/' + ProfileFound.pictureUrl.split('/images/')[1]);
            fs.unlink('./images/' + ProfileFound.pictureUrl.split('/images/')[1], (err) => {
              if (err) {
                console.error(err);
              }
            })
          }
        }
        ProfileModified.pictureUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
      }
      Profile.update({...ProfileModified} ,{where:{userId : ProfileFound.userId}})
      .then(() => {
        res.status(200).json({message: 'Objet modifié !'})
      })
      .catch(() => res.status(500).json({message: 'Erreur lors de l\'édition de l\'objet !'}));
    })
    .catch(() => res.status(404).json({message: 'User not found !'}));
  })
  .catch(() => res.status(404).json({message: 'Profile not found !'}));

}
exports.getUserSchema = () =>{
  return User;
}