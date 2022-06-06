import '../styles/Top.css'
import '../styles/App.css'
import options from '../assets/Icons/options.png'
import {Profile} from './Profile'
import {Banner} from './Banner'
import {Posts} from './Posts'
import { AddPost } from './AddPost'
import { Searchbar } from './Searchbar'
import ReactDOM from 'react-dom'
import { Account } from './Account'
import { Topics } from './Topics'
import { useEffect, useState } from 'react'
import { GetTopics } from '../services/posts.service'
import {ReactSession} from 'react-client-session'

export const Top = () =>{

    const [topics,setTopics] = useState([]);
    const [load,setLoad] = useState(false);

    useEffect(() => {
        GetTopics()
        .then(data => {
            setTopics(data);
            setLoad(true);
        })
        .catch((err) => console.log(err)) 
      }, [])

    let topicsElement = <></>;
    if(load){
        topicsElement = (
        <ul>{topics.map((top)=>
        <li className='topic' key={top.topic} id={top.topic} onClick={(e) => handleClickTopic(e)}>
            <p>{top.count}#{top.topic}</p>
        </li>
        )}</ul>);
    }
    let topElement = (
        <div className="top">
        <div id='options'>
            <div id='options-anchor'>
                <div id='options-padding'>
                    <div className='options-link'><a onClick={handleClickAccount}>Account</a></div>
                    <div className='options-link'><a onClick={handleClickTopics}>Topics</a>
                        {topicsElement}
                    </div>
                </div>
                <a href="#" id="options-button"><img src={options} alt="options" className="options-icon"></img></a>
            </div>
            <Searchbar />
        </div>
        <div className="navbar">
            <a href="#" onClick={(e) => handleClickProfile(e)}>PROFILE</a>
            <a href="#" onClick={(e)=>handleClickHome(e)}>HOME</a>
            <a href="#" onClick={handleClickLogout} >LOG OUT</a>
        </div>
    </div>
    );
    return (
        <div>
            {topElement}
        </div>
        );

    function handleClickTopics(){
        ReactDOM.render(
            <div className='relative'>
                <div className='sticky'>
                    <Banner />{topElement}
                </div>
                <div>
                    <Topics />
                </div>
             </div>
                ,document.getElementById('root'));
    }

    function handleClickTopic(e){
        e.preventDefault();
        e.stopPropagation();
        let topicId = e.target.id;
        if(topicId === ''){
            topicId = ReactDOM.findDOMNode(e.target).parentNode.id;
        }
        ReactDOM.render(
            <div>
            </div>,
            document.getElementById('root')
        );
        setTimeout(() => {
            ReactDOM.render(
                <div className='relative'>
                    <div className='sticky'>
                        <Banner />
                        {topElement}
                    </div>
                    <div>
                        <AddPost topic={topicId} /><Posts topic={topicId}/>
                    </div>
                </div>
                    ,document.getElementById('root'));
            }, 100);
    }

    function handleClickAccount(){
        ReactDOM.render(
        <div className='relative'>
            <div className='sticky'>
                {topElement}
            </div>
            <Account />
        </div>
            ,document.getElementById('root'));
    }

    function handleClickProfile(e){
        e.preventDefault();
        ReactDOM.render(
            <div>
            </div>,
            document.getElementById('root')
        );
        setTimeout(() => {
            ReactDOM.render(
                <div className='relative'>
                    <div className='sticky'>
                        <Banner />
                        {topElement}
                    </div>
                    <Profile id={sessionStorage.getItem("userId")} />
                </div>,
                document.getElementById('root')
            );
        }, 100);
    }

    function handleClickLogout() {
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("token");
        ReactSession.set("userId",null);
        ReactSession.set("token",null);
        window.location.reload();
    }

    function handleClickHome(e) {
        e.preventDefault();
        ReactDOM.render(
            <div>
            </div>,
            document.getElementById('root')
        );
        setTimeout(() => {
            ReactDOM.render(
                <div className='relative'>
                    <div className='sticky'>
                        <Banner />
                        {topElement}
                    </div>
                    <div><AddPost topic='notopic'/><Posts topic="notopic"/></div>
                </div>,
                document.getElementById('root')
            );
        }, 100);
    }
}