import '../styles/Posts.css'
import like from '../assets/Icons/like.png'
import dislike from '../assets/Icons/dislike.png'
import likeActive from '../assets/Icons/likeActive.png'
import dislikeActive from '../assets/Icons/dislikeActive.png'
import Trash from '../assets/Icons/Trash.webp'
import { useState, useEffect, useRef, useCallback } from 'react'
import {GetPosts,DelPost,LikePost} from '../services/posts.service'
import {SearchProfiles} from '../services/profiles.service'
import {Comments} from './Comments'
import {Top} from './Top'
import {Profile} from './Profile'
import {Banner} from './Banner'

import ReactDOM from 'react-dom'

export const Posts = (topic) => {

    const [posts, setPosts] = useState([]);
    const [load,setLoad] = useState(false);
    const [profiles, setProfiles] = useState({});
    const [iterations, setIterations] = useState(10);
    const [change,setChange] = useState(false);
    
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

    const getAccess = (userId) =>{
        if(profiles[userId] !== undefined){
            return profiles[userId].access;
        }
        return("none");
    }

    const handleClickAuthor = (profileId) =>{
        ReactDOM.render(
            <div className='relative'>
                <div className='sticky'>
                    <Banner />
                    <Top />
                </div>
                <Profile id={profileId} />
            </div>,
              document.getElementById('root')
        );
    }

    const handleClickLoadMore = () => {
        setIterations((iterations+5));
    }

    const handleClickDelete = (e) => {
        let postId = ReactDOM.findDOMNode(e.target).parentNode.id;
        if(postId === ''){
            postId = ReactDOM.findDOMNode(e.target).parentNode.parentNode.id
        }

        DelPost(postId)
        .then(()=>{ refresh() });
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

    const refresh = () => {
        setChange(!change);
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
        GetPosts(topic.topic)
        .then(data => setPosts(data))
        .catch((err) => console.log(err)) 
      }, [change])

      useEffect(() => {
        if(posts !== null){
            let authorUserIds = []
            for(let i = 0; i < posts.length; i++){
                if(!(authorUserIds.includes(posts[i].userId))){
                    authorUserIds.push(posts[i].userId);
                }
            }
            authorUserIds.push(sessionStorage.getItem("userId"));

            SearchProfiles(authorUserIds)
            .then(data => {
                setProfiles(data);
                if(posts.length > 0){
                    setLoad(true);
                }       
            })
            .catch((err) => console.log(err));
        }
    }, [posts])

    let postsElement = (<div>"Loading..."</div>);

    if(load){
        let deletePostElement = {};
        deletePostElement[sessionStorage.getItem("userId")] = (<button className='delete-post' onClick={(e) => handleClickDelete(e)}><img className='delete-post-icon' src={Trash} width='10' height='10'></img></button>);
        if(getAccess(sessionStorage.getItem("userId")) === "admin"){
            for(let i = 0;i < posts.length; i++){
                deletePostElement[posts[i].userId] = deletePostElement[sessionStorage.getItem("userId")];
            }
        }
        postsElement = (
            <ul>
              {posts.slice(0,iterations).map((post) =>
                <li className='post' key={post.uid}>
                    <div className='post-title'>
                        <div className='post-author'>
                            <div className='post-title-picture-frame'>
                                <img className='post-title-picture' src={profiles[post.userId].pictureUrl}></img>
                            </div>
                            <a onClick={() => handleClickAuthor(post.userId)}>{profiles[post.userId].firstname} {profiles[post.userId].lastname}</a>
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
                              <a href='#' className='show-comment'><p onClick={(e) => handleClickComments(post.uid,e)}>comments</p></a>
                          </div>
                      </div>
                      <div className='comments-section' id={'comments-'+post.uid}>
                        <Comments id={post.uid}/>
                      </div>
                  </div>
                </li>)}
            </ul>
            );
    }

    if(posts !== null){
        if(posts.length === 0){
            postsElement = <h1>No posts yet</h1>
        }
    }

    let loadElement = (<div></div>);
    if(posts !== null){
        if(iterations < posts.length){
            loadElement = (<div id="load-more" onClick={handleClickLoadMore}>LOAD MORE POSTS</div>);
        }
    }

    return (
        <div className="posts">
            <div className='posts-padding'>
                <div className='posts-content'>
                    {postsElement}
                </div>
            </div>
            {loadElement}
        </div>
    )
}

const handleClickComments = (postId,e) => {
    e.preventDefault();
    let x = document.getElementById("comments-"+postId);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
