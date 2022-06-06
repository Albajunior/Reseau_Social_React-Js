import '../styles/Topics.css'
import { GetTopics } from '../services/posts.service'
import { useState, useEffect, useRef, useCallback } from 'react'
import {Banner} from './Banner'
import {Posts} from './Posts'
import { AddPost } from './AddPost'
import {Top} from './Top'
import ReactDOM from 'react-dom'

export const Topics = () => {

    const [topics,setTopics] = useState([]);
    const [load,setLoad] = useState(false);
    const [iterations, setIterations] = useState(20);

    const handleClickLoadMore = () => {
        setIterations((iterations+10));
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
                <div>
                    <div>
                        <Banner /><Top />
                    </div>
                    <div>
                        <AddPost topic={topicId} /><Posts topic={topicId}/>
                    </div>
                </div>
                    ,document.getElementById('root'));
            }, 100);
    }

    useEffect(() => {
        GetTopics()
        .then(data => {
            setTopics(data);
            setLoad(true);
        })
        .catch((err) => console.log(err)) 
    }, [])

    let topicsElement = (<div>"Loading..."</div>);

    let loadElement = (<div></div>);
    if(topics !== null){
        if(iterations < topics.length){
            loadElement = (<div id="load-more" onClick={handleClickLoadMore}>LOAD MORE POSTS</div>);
        }
    }
    if(load){
        topicsElement = (<ul id='page-topics'>{topics.slice(0,iterations).map((top)=>
        <li className='page-topic' key={top.topic} id={top.topic} onClick={(e) => handleClickTopic(e)}>
            <p>{top.count}#{top.topic}</p>
        </li>
        )}</ul>);
    }
    if(topics !== null){
        if(topics.length === 0){
            topicsElement = <h1>No topics yet</h1>
        }
    }
    return (
        <div>
            {topicsElement}
            {loadElement}
        </div>

    );
}