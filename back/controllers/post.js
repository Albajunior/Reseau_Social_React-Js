const {sequelize, User, Post} = require('../models/');
const fs = require('fs');

exports.getAllPosts = (req,res) =>{
  if(req.params.topic === "notopic"){
    Post.findAll({ order: [['createdAt', 'DESC']]})
      .then(Posts => res.status(200).json(Posts))
      .catch(error => res.status(500).json({ error }));
  }
  else{
    Post.findAll({where:{topic:req.params.topic}, order: [['createdAt', 'DESC']]})
    .then(Posts => res.status(200).json(Posts))
    .catch(error => res.status(500).json({ error }));
  }
};

const sortTopics = async (tab) =>{
  let topValue = 0;
  sorting = {}
  let sorted = [];
  for(let i = 0; i< tab.length; i++){
    if(sorting[tab[i].count] === undefined){
      sorting[tab[i].count] = tab[i].topic;
    }
  }

  for(let i of Object.keys(sorting)){
    if(Number(i) > topValue){
      topValue = i;
    }
  }

  for(let i = topValue; i > 0; i--){
    if(sorting[i] !== undefined){
      sorted.push({topic:sorting[i],count:i});
    }
  }
  return sorted;
}

exports.getAllPostsTopics = (req,res) =>{
  Post.findAndCountAll()
  .then(all => {
    let Posts = all.rows;
    let topics = [];
    let ok = false;
    let id = 0;
    let sent = false;
    Posts.map(post =>{
      Post.findAndCountAll({where:{topic:String(post.topic)}})
      .then(result =>{
        id++;

        if(topics.length === 0 && post.topic !== "notopic"){
          topics.push({topic: post.topic,count: result.count});
        }
        else{
          for(let i = 0; i < topics.length; i++){
            if(post.topic !== "notopic" && JSON.stringify(topics[i]) !== JSON.stringify({topic: post.topic,count: result.count})){
              topics.push({topic: post.topic,count: result.count});
              break;
            }
          }
        }
        
        if(id === all.count && !sent){
          sent = true;
          sortTopics(topics).then((sorted)=>{
            return res.status(200).json(sorted);
          })
        }
        
      });
    })
  })
  .catch(error => res.status(500).json({ error }));
}

exports.getAllPostsFromUser = (req,res) =>{

  Post.findAll()
  .then(posts => {
    let postsFromUser = []
    for(let i = 0; i < posts.length; i++){
      if(posts[i].userId === req.params.id){
        postsFromUser.push(posts[i]);
      }
    }
    res.status(200).json(postsFromUser)
  })
  .catch(error => res.status(400).json({ error }));
};
  
exports.getOnePost = (req, res) => {

  Post.findOne({where:{ userId: req.params.id }})
  .then(Post => res.status(200).json(Post))
  .catch(error => res.status(404).json({ error }));
};

exports.postPost = (req, res) => {

    if (!req.body.content) {
    return res.status(400).send(new Error('Bad request !'));
  }

  let PostCreated = {...req.body};
  PostCreated.userId = res.locals.userId;
  if(PostCreated.likes || 
    PostCreated.dislikes || 
    PostCreated.usersDisliked || 
    PostCreated.usersLiked || 
    PostCreated.comments){
    return res.status(403).send(new Error('Forbidden !'));
  }

  if(req.file){
    PostCreated.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  }

  if(PostCreated.topic){
    if(PostCreated.topic === ''){
      PostCreated.topic = 'notopic';
    }
  }

  Post.create({...PostCreated}).then(() => {
      res.status(201).json({message: "Objet créé !"});
    })
    .catch(() => {

      if(req.file){
        if(PostCreated.imageUrl){
          fs.unlink('./images/' + PostCreated.imageUrl.split('/images/')[1], (err) => {
            if (err) {
              console.error(err)
            }
          })
        }
      }
      res.status(500).json({message: "Erreur lors de la création de l'objet !"})
  });
};

exports.editPost = (req,res) => {

  if (!(req.body.content &&  
    !req.body.likes &&
    !req.body.dislikes &&
    !req.body.usersLiked &&
    !req.body.usersDisliked &&
    !req.body.comments) && !req.body.post) {
      return res.status(400).send(new Error('Bad request!')
        );
  }
  
  let PostModified;
  if(req.body.post){
    /*Post format : 
    {"content":"..."}*/
    
    PostModified = JSON.parse(req.body.post);
  }
  else{
    PostModified = { ...req.body};
    if(PostModified.likes || 
      PostModified.dislikes || 
      PostModified.usersDisliked || 
      PostModified.usersLiked || 
      PostModified.comments){
        return res.status(403).send(new Error('Forbidden !'));
      }
  }
  if(req.file){
    PostModified.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  }

  Post.findOne({where:{uid : req.params.id}})
  .then(post => {
    User.findOne({where:{ uid: res.locals.userId }})
    .then(userFound => {
      if (res.locals.userId !== post.userId && userFound.access !== "admin"){
        return res.status(401).json({message: "Unauthorized !"});
      }
      if(req.file){

        if(post.imageUrl !== "noimage"){
          fs.unlink('../back/images/' + post.imageUrl.split('/images/')[1], (err) => {
            if (err) {
              console.error(err)
            }
          })
        }
      }

      PostModified.userId = post.userId;
      Post.update({...PostModified}, {where:{uid: req.params.id}})
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => {
        if(req.file){
          if(PostModified.imageUrl !== "noimage"){
            fs.unlink('../back/images/' + PostModified.imageUrl.split('/images/')[1], (err) => {
              if (err) {
                console.error(err)
              }
            })
          }
        }
        res.status(400).json({ error })
      });
    });
  })
  .catch(error => res.status(404).json({ error }));
};

exports.deletePost = (req,res) => {

  Post.findOne({where:{uid: req.params.id}})
    .then(post => {
      User.findOne({where:{uid: res.locals.userId}})
      .then(userFound => {
        if (res.locals.userId !== post.userId && userFound.access !== "admin"){
          return res.status(401).json({message: "Unauthorized !"});
        }

        if(post.imageUrl !== "noimage"){
          fs.unlink('./images/' + post.imageUrl.split('/images/')[1], (err) => {
            if (err) {
              console.error(err)
            }
          })
        }
        Post.destroy({where:{ uid: req.params.id}})
        .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
        .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => {
      console.log(error);
      return res.status(404).json({ message: "Objet non trouvé  !" });
    });
};

exports.postLike = (req,res) => {

  if(req.body.like && req.body.like === 1 || req.body.like === -1){
    Post.findOne({where:{ uid: req.params.id}})
    .then(post => {

      if(post.userId === res.locals.userId){
        return res.status(403).json({message: "Forbidden !"});
      }
      let PostLiked = {
        "userId": post.userId,
        "content": post.content,
        "imageUrl": post.imageUrl,
        "likes": post.likes,
        "dislikes": post.dislikes,
        "usersLiked": post.usersLiked,
        "usersDisliked": post.usersDisliked,
        "comments": post.comments
      };
      //Like
      if(req.body.like === 1){
        if(!PostLiked.usersLiked.includes(String(res.locals.userId))){
          PostLiked.likes += 1;
          PostLiked.usersLiked.push(String(res.locals.userId));
          if(PostLiked.usersDisliked.includes(String(res.locals.userId))){
            PostLiked.dislikes -= 1;
            PostLiked.usersDisliked.splice(PostLiked.usersDisliked.indexOf(String(res.locals.userId)));
          }
        }
        //Remove Like
        else{
          PostLiked.likes -= 1;
          PostLiked.usersLiked.splice(PostLiked.usersLiked.indexOf(String(res.locals.userId)));
        }
      }
      //Dislike
      else if(req.body.like === -1){
        if(!PostLiked.usersDisliked.includes(String(res.locals.userId))){
          PostLiked.dislikes += 1;
          PostLiked.usersDisliked.push(String(res.locals.userId));

          if(PostLiked.usersLiked.includes(String(res.locals.userId))){
            PostLiked.likes -= 1;
            PostLiked.usersLiked.splice(PostLiked.usersLiked.indexOf(String(res.locals.userId)));
          }
        }
        //Remove dislike
        else{
          PostLiked.dislikes -= 1;
          PostLiked.usersDisliked.splice(PostLiked.usersDisliked.indexOf(String(res.locals.userId)));  
        }
      }
    
    Post.update( {...PostLiked}, {where:{uid: req.params.id}})
      .then(() => res.status(200).json({ message: 'Like ajouté !'}))
      .catch(() => res.status(500).json({ message: 'Erreur lors de l\'ajout du like !'}));
    })
    .catch(() => res.status(404).json({ message: "Objet non trouvé  !" }));
  }
  else{
    return res.status(400).send(new Error('Bad request!'));
  }
};

exports.getPostSchema = () =>{
  return Post;
}