import '../styles/Login.css'
import {Signup} from './Signup'
import {LoginUser} from '../routes/credentials.service'
import {ReactSession} from 'react-client-session'

export const Login = () => {

    return (
        <div>
            <div id='login-component'>
                <h1>Connexion:</h1>
                <form id='login-form' className='forminscription' onSubmit={(e) => handleSubmit(e)}>
                    <p>E-mail </p>
                    <input name='email-input'></input>
                    <p>Password :</p>
                    <input name='password-input' type='password'></input>
                    <button name='submit' className='forminscriptionbutton'>Se connecter</button>
                </form>
                <p>Creer un compte ? : <a href='#' onClick={handleClick}>Inscription</a></p>
            </div>
            <div id='signup-component'><Signup /></div>
        </div>
        )
}

function handleSubmit(e) {
    e.preventDefault()
    const email = e.target['email-input'].value;
    const password = e.target['password-input'].value;
    LoginUser(email,password).then((data) => {
        if(data.token){
            ReactSession.set("userId",data.userId);
            ReactSession.set("token",data.token);
            sessionStorage.setItem("userId",data.userId)
            sessionStorage.setItem("token",data.token)
            window.location.reload();
        }
        else{
            alert("Error during the logging !")
        }
    });
}

function handleClick(){
    let x = document.getElementById("signup-component");
    let y = document.getElementById("login-component");
    x.style.display = "block";
    y.style.display = "none";  
}