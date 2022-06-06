import { TextSearchProfiles } from "../services/profiles.service"
import {Profile} from "./Profile"
import {Top} from "./Top"
import ReactDOM from 'react-dom'

export const Searchbar = () =>{

    return (
    <div className="searchbar">
        <form id='search-form' onKeyUpCapture={(e)=>{handleKeyUp(e)}}>
                <input id='search-input'></input>
                <button id='search-button'>SEARCH</button>
                <span id='search-results'></span>
            </form>
    </div>
        )

    function handleClick(profileId){
        ReactDOM.render(
            <div>
            </div>,
              document.getElementById('root')
        );
        setTimeout(() => {
        ReactDOM.render(
            <div>
                <Top />
                <Profile id={profileId} />
            </div>,
              document.getElementById('root')
        );
        }, 100);
    }

    function handleKeyUp(e){
        e.preventDefault();
        if(e.target.value !== ''){
            TextSearchProfiles(e.target.value).then((profiles) =>{
            ReactDOM.render(
            <ul id='search-list'>
                {profiles.map((profile) => 
                <li key={profile.userId}>
                    <a href='#' onClick={()=>{handleClick(profile.userId)}}>{profile.firstname} {profile.lastname}</a>
                </li>)}
            </ul>,
            document.getElementById("search-results"));
            }); 
        }
        else{
            ReactDOM.render(
                <ul id='search-list'>
                </ul>,
                document.getElementById("search-results"));
        }
    }
}