import '../styles/AddPost.css'
import {PostPost} from '../services/posts.service'
import {GifSearch} from './GifSearch'
import {Banner} from './Banner'
import {Top} from './Top'
import {Posts} from './Posts'
import { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import ReactDOM from 'react-dom'

export const AddPost = (topic) => {

    const [topicSegment,setTopic] = useState(<input id='set-topic-input' name='set-topic-input'></input>);
    const [image,setImage] = useState(null);

    useEffect(()=>{
        console.log(topic.topic);
        if(topic.topic !== 'notopic'){
            setTopic(<input id='set-topic-input' value={topic.topic}></input>);
        }
    },[]);

    function handleInput(){
        let element = document.getElementById("addpost-frame");
        let input = document.getElementById("addpost-input");
        element.style.height = input.style.height+"px";
    }
    
    function handleSubmit(e){
        e.preventDefault();
        if(image !== null || document.getElementById("addpost-input").value !== ''){
            let text = document.getElementById("addpost-input").value;
            let topic = e.target['set-topic-input'].value;
            if(topic === ''){
                topic = 'notopic';
            }
            PostPost(text,topic,image).then(()=>{
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
                            <Top />
                        </div>
                        <AddPost topic={topic}/>
                        <Posts topic={topic}/>
                    </div>,document.getElementById('root'));
                }, 100);
            });
        }
    }
    
    function handleInputImage(e){
        const file = Array.from(e.target.files);
        console.log("file: "+file[0].name);
        if(file[0].name.endsWith(".jpg") || file[0].name.endsWith(".jpeg") || file[0].name.endsWith(".png")){
          console.log("ok");
          setImage(file[0]);
        }
        else{
        }
      }

    function handleClickGifs(){
        ReactDOM.render(<GifSearch place='addpost'/>, document.getElementById('gif-anchor-addpost'));
    }
    //        <span contentEditable={true} role='textbox' id='addpost-input' name='addpost-input'>What's on your mind ?</span>
    return (<div id="addpost-frame">
    <form id='addpost-form' onSubmit={(e) => handleSubmit(e)} onInput={()=>handleInput()}>
        <div id='set-topic'><p>Topic #</p>{topicSegment}</div>
        <TextareaAutosize onInput={handleInput} role='textbox' placeholder="What's on your mind ?" id="addpost-input" name="addpost-input" rows="4"/>
        <button id='addpost-submit' name='addpost-submit'>POST</button>
        <div id='media'>
            <input type='file' id='upload' onInput={(e) => handleInputImage(e)} width='20' height='20' multiple/>
            <a className='gifs' onClick={handleClickGifs}>GIFS</a>
            <div id='gif-anchor-addpost'></div>
        </div>
    </form>
    </div>);
;
}