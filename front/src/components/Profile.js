import '../styles/Profile.css'
import '../styles/Posts.css'
import like from '../assets/Icons/like.png'
import dislike from '../assets/Icons/dislike.png'
import likeActive from '../assets/Icons/likeActive.png'
import dislikeActive from '../assets/Icons/dislikeActive.png'
import Trash from '../assets/Icons/Trash.webp'
import {useState,useEffect,useRef,useCallback} from 'react'
import {GetProfile,GetProfilePosts, EditProfile} from '../services/profiles.service'
import {DelPost,LikePost} from '../services/posts.service'
import {Comments} from './Comments'
import {EditMainInfos} from './EditMainInfos'
import {EditSecondaryInfos} from './EditSecondaryInfos'
import ReactDOM from 'react-dom'

export const Profile = (userId) =>{
    const [profile, setProfileInfos] = useState({});
    const [viewingProfile, setViewingProfile] = useState({});
    const [posts, setProfilePosts] = useState([]);
    const [iterations, setIterations] = useState(10);
    const [load, setLoad] = useState(false);
    const [formData,setFormData] = useState(null);
    const [change, setChange] = useState(false);

    const liked = {};
    const disliked = {};
    
    liked[false] = like;
    liked[true] = likeActive;
    disliked[false] = dislike;
    disliked[true] = dislikeActive;


    const getImage = (post) =>{
      if(post.imageUrl !== 'noimage'){
          return (<img className='post-image' src={post.imageUrl}></img>);
      }
      else{
          return (<></>);
      }
    }

    const refresh = () => {
      setChange(!change);
    }

    const handleClickLoadMore = () => {
      if((iterations+5 > posts.length)){
        setIterations(posts.length);
      }
      else{
        setIterations((iterations+5));
      }
    }
    
    const handleClickLike = (e) =>{
      e.preventDefault();
      let postId = String(e.target.parentNode.id).substring(5);
      LikePost(postId,1)
      .then(()=>{ refresh() });
    }

    const handleClickDislike = (e) =>{
      e.preventDefault();
      let postId = String(e.target.parentNode.id).substring(8);
      LikePost(postId,-1)
      .then(()=>{ refresh() });
    }

    const handleClickDelete = (e) => {
      let postId = ReactDOM.findDOMNode(e.target).parentNode.id;
      if(postId === ''){
          postId = ReactDOM.findDOMNode(e.target).parentNode.parentNode.id
      }

      DelPost(postId)
      .then(()=>{ refresh();});
  }
    const handleInput = (e) => {
      const file = Array.from(e.target.files);
      console.log("file: "+file[0].name);
      if(file[0].name.endsWith(".jpg") || file[0].name.endsWith(".jpeg") || file[0].name.endsWith(".png")){
        console.log("ok");
        setFormData(file[0]);
      }
      else{
      }
    }
    const handleSubmit = (e) => {
      e.preventDefault();
      if(formData !== null){
        EditProfile(profile,formData)
        .then((data) =>{
          refresh();
        })
      }
    }

    const formatContent = (text) =>{
      const tab = text.split(' ');
      let content = [];
      let string = '';
      for(let i = 0; i < tab.length; i++){
          if(tab[i].startsWith(':') && tab[i].endsWith(':')){
              content.push((<p>{string}</p>));
              string = '';
              content.push((<img src={tab[i].substring(1,tab[i].length-1)}></img>));
          }
          else if(tab[i].split('.').length > 1){
            content.push((<a href={tab[i]}>{tab[i]}</a>));
          }
          else{
              string += ' '+tab[i];
          }
      }

      if(string !== ''){
          content.push((<p>{string}</p>));
      }

      return (<div>
          {content.map((el)=>el)}
      </div>);
  }

    useEffect(() => {
      GetProfile(userId)
      .then(data => setProfileInfos(data))
      .catch((err) => console.log(err))
    }, [change])

    useEffect(() => {
      GetProfile({id : sessionStorage.getItem("userId")})
        .then(data => setViewingProfile(data))
        .catch((err) => console.log(err))  
    }, [])

    useEffect(() => {
      if(viewingProfile !== undefined && profile !== undefined){
        setLoad(true);
      }
    }, [viewingProfile,profile])

    useEffect(() => {
      GetProfilePosts(userId)
      .then(data => setProfilePosts(data))
      .catch((err) => console.log(err)) 
    }, [change])

    let editMainInfosElement = <></>;
    let editSecondaryInfosElement = <></>;
    let postsElement = <></>;
    let editProfilePictureElement = <></>;

    if(load && profile.firstname !== undefined){

      let deletePostElement = {};
      deletePostElement[sessionStorage.getItem("userId")] = (<button className='delete-post' onClick={(e) => handleClickDelete(e)}><img className='delete-post-icon' src={Trash} width='10' height='10'></img></button>);
      if(viewingProfile.access === "admin"){
          for(let i = 0;i < posts.length; i++){
              deletePostElement[posts[i].userId] = deletePostElement[sessionStorage.getItem("userId")];
          }
      }

      let p = {...profile,canEdit : false};
      editMainInfosElement = <EditMainInfos profile={p}/>;
      editSecondaryInfosElement = <EditSecondaryInfos profile={p}/>;
      if(profile.userId === sessionStorage.getItem("userId") || viewingProfile.access === "admin"){
        p.canEdit = true
        editMainInfosElement = <EditMainInfos profile={p}/>;
        editSecondaryInfosElement = <EditSecondaryInfos profile={p}/>;
        editProfilePictureElement = (
        <form onSubmit={(e) => handleSubmit(e)}>
          <input type='file' id='upload' onInput={(e) => handleInput(e)} width='20' height='20' multiple />
          <button>UPLOAD</button>
        </form>);
      }
      postsElement = (        
      <ul>
        {posts.slice(0,iterations).map((post) =>
          <li className='post' key={post.uid}>
              <div className='post-title'>
              <div className='post-author'>
                <div className='post-title-picture-frame'>
                    <img className='post-title-picture' src={profile.pictureUrl}></img>
                </div>
                  <a>{profile.firstname} {profile.lastname}</a>
                </div>
                <div id={post.uid}>
                    {deletePostElement[post.userId]}
                  </div>
                </div>
                <div className='post-content'>
                  {formatContent(post.content)}
                </div>
                <div className='post-image-frame'>
                  {getImage(post)}
                </div>
            <div className='post-reviews'>
                <div className='post-reviews-row'>
                    <div className='likes-dislikes'>
                      <div className='post-like'>
                          <a id={'like-'+post.uid} onClick={(e) => handleClickLike(e)} href='#'><img className='like-icon' src={liked[post.usersLiked.includes(sessionStorage.getItem("userId"))]} width="20" height="20"></img></a> <p>{post.likes}</p>
                        </div>
                        <div className='post-dislike'>
                            <a id={'dislike-'+post.uid} onClick={(e) => handleClickDislike(e)} href='#'><img className='dislike-icon' src={disliked[post.usersDisliked.includes(sessionStorage.getItem("userId"))]} width="20" height="20"></img></a> <p>{post.dislikes}</p>
                        </div>
                    </div>
                    <div className='comments'>
                    <a href='#' className='show-comment'><p onClick={(e) => handleClickComment(post.uid,e)}>comments</p></a>
                    </div>
                </div>
                <div className='comments-section' id={'comments-'+post.uid}>
                      <Comments id={post.uid}/>
                </div>
              </div>
          </li>)}
      </ul>
      )
    }

    if(posts.length == 0){
      postsElement = <h1>No posts yet</h1>
    }

    let loadElement = (<div></div>);
    if(iterations < posts.length){
        loadElement = (<div id="load-more" onClick={handleClickLoadMore}>LOAD MORE POSTS</div>);
    }

    return (
    <div>
      <div className='profile-frame'>
        <div id='main-infos'>
            {editMainInfosElement}        
        </div>
        <div id='secondary-infos'>
          <div id='picture-frame'>
            <img id="profile-picture" src={profile.pictureUrl}></img>
          </div>
            {editSecondaryInfosElement}        
        </div>
          {editProfilePictureElement}
      </div>
      <div id='posts-frame'>
            <div className='posts-padding'>
                <div className='posts-content'>
                    {postsElement}
                </div>
            </div>
            {loadElement}
        </div>
      </div>
        )
}

const handleClickComment = (id,e) => {
  e.preventDefault();
  let x = document.getElementById("comments-"+id);
  if (x.style.display === "none") {
      x.style.display = "block";
  } else {
      x.style.display = "none";
  }
}