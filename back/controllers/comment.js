const {sequelize, User, Comment, Post} = require('../models/');

exports.getAllCommentsFromPost = (req,res) =>{

  Comment.findAll({where:{post : req.params.id}})
    .then(Comments => {
      res.status(200).json(Comments)
    })
    .catch(error => res.status(400).json({ error }));
};

exports.getOneComment = (req,res) =>{
    Comment.findOne({where:{uid : req.params.id}})
    .then((commentFound) =>{
      res.status(200).json(commentFound);
    })
    .catch(error => res.status(400).json({ error }));
};

exports.postComment = (req,res) => {
  if(!req.body.comment){
    return res.status(400).send(new Error('Bad request!'));
  }
  else if(req.body.comment.length > 255){
    return res.status(400).send(new Error('Bad request!'));
  }

  Post.findOne({where:{ uid: req.params.id}})
  .then(post => {
    //Add comment
    Comment.create({
        author : res.locals.userId,
        text : req.body.comment,
        post : post.uid,
    })
    .then((comment) => {

      post.comments.push({commentId : String(comment.uid)});
      let PostCommented = {
          "userId" : post.userId,
          "content" : post.content,
          "likes" : post.likes,
          "dislikes" : post.dislikes,
          "usersLiked" : post.usersLiked,
          "usersDisliked" : post.usersDisliked,
          "comments": post.comments
      };

    Post.update({ ...PostCommented},{where:{ uid: req.params.id}})
      .then(() => res.status(200).json({ message: 'Opération réussie !'}))
      .catch(() => res.status(400).json({ message: 'Erreur lors de l\'opération !'}));
    })
    .catch(() => res.status(500).json({ message : "Erreur lors de la création de l'objet !"}));
  })
  .catch(() => res.status(404).json({ message: "Objet non trouvé  !" }));
  };

  exports.deleteComment = (req,res) => {
    let postId;

      Comment.findOne({where:{ uid: req.params.id}})
        .then(comment => {
          postId = comment.post;
          User.findOne({ uid: res.locals.userId })
          .then(userFound => {
            if (res.locals.userId !== comment.author && userFound.access !== "admin"){
              return res.status(401).json({message: "Unauthorized !"});
            }
            Comment.destroy({where:{ uid: req.params.id}})
            .then(() => {
              Post.findOne({where:{uid : postId}})
              .then(post => {

                let tab = [...post.comments];
                let tab2 = [];

                for(let i = 0; i < post.comments.length; i++){
                  if(String(tab[i].commentId) != String(req.params.id)){
                    tab2.push(tab[i]);
                  }
                }
                const PostModified = {
                  "userId" : post.userId,
                  "content" : post.content,
                  "likes" : post.likes,
                  "dislikes" : post.dislikes,
                  "usersLiked" : post.usersLiked,
                  "usersDisliked" : post.usersDisliked,
                  "comments" : tab2
                }

                Post.update({ ...PostModified},{where:{ uid: postId}})
                .then(() => res.status(200).json({ message: 'Opération réussie !'}))
                .catch(() => res.status(400).json({ message: 'Erreur lors de l\'opération !'}));              
              })
              .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(400).json({ error }));
          });
        })
        .catch(error => {
          console.log(error);
          return res.status(404).json({ message: "Objet non trouvé  !" });
        });
  };