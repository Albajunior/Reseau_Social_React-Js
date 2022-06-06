import '../styles/App.css'
import {Banner} from './Banner'
import {Top} from './Top'
import {AddPost} from './AddPost'
import {Posts} from './Posts'
import {Login} from './Login'
import {ReactSession} from 'react-client-session'

ReactSession.setStoreType("localStorage");

const App = () =>{

    if(ReactSession.get("token") === null){
        return <div><Banner /><Login /></div>
    }
    sessionStorage.setItem("token", ReactSession.get("token"));
    sessionStorage.setItem("userId", ReactSession.get("userId"));

    return <div className='relative'>
            <div className='sticky'>
                <Banner /><Top />
            </div>
            <div>
                <AddPost topic='notopic'/><Posts topic="notopic"/>
            </div>
        </div>
}

export default App;