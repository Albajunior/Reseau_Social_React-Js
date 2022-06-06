import '../styles/GifSearch.css'
import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'

export const GifSearch = (place) =>{

    const [gifs, setGifs] = useState([]);
    const [term, updateTerm] = useState('');
    const [iterations,setIterations] = useState(10);

    useEffect(()=>{
        fetchGifs().then(()=>{
            gifs.map((gif)=>{
                console.log(gif);
            })
        });
      
    },[term]);

    async function fetchGifs() {
        try {
        const API_KEY = 'EP7RKmRrQ1bMjBgJAFIR01e0FLIh7ds8';
        const BASE_URL = 'http://api.giphy.com/v1/gifs/search';
        fetch(`${BASE_URL}?api_key=${API_KEY}&q=${term}`)
        .then((resJson)=>{
            resJson.json().then((res)=>{
                setGifs(res.data);
            });
        });
        } catch (error) {
        console.warn(error);
        }
    }

    function handleGifSearch(e) {
        let newTerm = e.target.value;
        updateTerm(newTerm);
    }

    function handleClickLoadMore(){
        setIterations(iterations+10);
    }

    function handleClickCloseGifs(){
        ReactDOM.render(<></>, document.getElementById('gif-anchor-'+place.place));
    }

    function handleClickGif(e){
        if(place.place !== 'addpost'){
            document.getElementById('comment-input-'+place.place).value += " :"+e.target.src+":";
        }
        else{
            document.getElementById('addpost-input').value += " :"+e.target.src+":";
        }
    }

    return (
        <div className='gif-search'>
            <div className='gif-search-top'>
                <input className='gif-search-input' onInput={(e) => handleGifSearch(e)} width='20' height='20' multiple/>
                <a className='gif-close' onClick={handleClickCloseGifs}>X</a>
            </div>
            <ul className='gif-list'>
                {gifs.slice(0,iterations).map((gif)=>
                    <li className='gif' onClick={(e)=>handleClickGif(e)} id={gif.id} key={gif.id}>
                        <img src={gif.images.fixed_height.url}></img>
                    </li>
                )}
            </ul>
            <button className='load-gifs-button' onClick={handleClickLoadMore}>+</button>
        </div>
    );
}