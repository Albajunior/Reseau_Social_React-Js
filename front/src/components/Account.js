import "../styles/Account.css"
import { useEffect, useState } from "react";
import { GetUser, EditUserPassword, EditUserEmail, DeleteUser } from "../services/accounts.service"
import {ReactSession} from 'react-client-session'
import ReactDOM from 'react-dom'

export const Account = () =>{

    const [user,setUser] = useState({});
    const [load,setLoad] = useState(false);
    const [change,setChange] = useState(false);

    const handleSubmitPassword = (e) =>{
        e.preventDefault();
        if(e.target['password-change-input'].value === e.target['password-change-confirm'].value){
            console.log("test");
            EditUserPassword(e.target["password-old-input"].value,e.target['password-change-input'].value)
            .then((res) => {
                e.target["password-old-input"].value = "";
                e.target["password-change-input"].value = "";
                e.target["password-change-confirm"].value = "";

                if(String(res).endsWith('400')){
                    document.getElementById("password-error").innerText = "Password is too weak !";
                    document.getElementById("password-error").style.display = "block";
                }
                else if(String(res).endsWith('403')){
                    document.getElementById("password-error").innerText = "Wrong password !";
                    document.getElementById("password-error").style.display = "block";
                }
                else{
                    document.getElementById("password-success").style.display = "block";
                }
            })
        }
        else{
            document.getElementById("password-change-error").style.display = "block";
        }
    }
    const handleSubmitEmail = (e) =>{
        e.preventDefault();
        EditUserEmail(e.target["email-change-input"].value)
        .then((res) => {
            refresh();
            e.target["email-change-input"].value = "";
            if(res.statusText == 'OK'){
                document.getElementById("email-success").style.display = "block";
            }
            else{
                document.getElementById("email-error").style.display = "block";
            }
        });
    }

    const handleInputPassword = () =>{
        if(document.getElementById("password-change-error").style.display === "block"){
            document.getElementById("password-change-error").style.display = "none";
        }
        if(document.getElementById("password-error").style.display === "block"){
            document.getElementById("password-error").style.display = "none";
        }
        if(document.getElementById("password-success").style.display == "block"){
            document.getElementById("password-success").style.display = "none";
        }
    }

    const handleInputEmail = () =>{
        if(document.getElementById("email-error").style.display === "block"){
            document.getElementById("email-error").style.display = "none";
        }
        if(document.getElementById("email-success").style.display === "block"){
            document.getElementById("email-success").style.display = "none";
        }
    }

    const handleSubmitDelete = (e) =>{
        e.preventDefault();
        DeleteUser(e.target["delete-input"].value)
        .then((res) => {
            if(res.statusText == 'OK'){
                sessionStorage.removeItem("userId");
                sessionStorage.removeItem("token");
                ReactSession.set("userId",null);
                ReactSession.set("token",null);
                ReactDOM.render(<div><h1>ACCOUNT DELETED</h1></div>,document.getElementById('root'));
                setTimeout(() => {
                    window.location.reload();
                    }, 100);
            }
            else{
                document.getElementById("delete-account-error").style.display = "block";
            }
            });
        }
    
    const handleInputDelete = () =>{
        if(document.getElementById("delete-account-error").style.display === "block"){
            document.getElementById("delete-account-error").style.display = "none";
        }
    }

    const refresh = () => {
        setChange(!change);
    }

    useEffect(()=>{
        GetUser(sessionStorage.getItem("userId"))
        .then((data)=>{setUser(data)});
    },[change]);

    useEffect(()=>{
        if(user !== {}){
            setLoad(true);
        }
    },[user]);

    if(load){
        return (
            <div id='account-frame'>
                <div id='email-frame'>
                    <h2>E-MAIL</h2>
                    <p>E-MAIL : {user.email}</p>
                    <form id='email-change-form' onInput={handleInputEmail} onSubmit={(e) => handleSubmitEmail(e)}>
                        <p>New e-mail :</p>
                        <input name='email-change-input'></input>
                        <button>Change</button>
                        <p className='form-error' id='email-error'></p>
                        <p className='form-success' id='email-success'>Email changed !</p>
                    </form>
                </div>
                <div id='password-frame'>
                <h2>PASSWORD</h2>
                    <form id='password-change-form' onInput={handleInputPassword} onSubmit={(e) => handleSubmitPassword(e)}>
                        <p>Old password :</p>
                        <input type='password' name='password-old-input'></input>
                        <p>New password :</p>
                        <input type='password' name='password-change-input'></input>
                        <p>Confirm new password :</p>
                        <input type='password' name='password-change-confirm'></input>
                        <button>Change</button>
                        <p className='form-error' id='password-change-error'>Passwords do not macth !</p>
                        <p className='form-error' id='password-error'></p>
                        <p className='form-success' id='password-success'>Password changed !</p>
                    </form>

                    </div>
                <div id='access-frame'><p>ACCESS :</p>{user.access}</div>
                <div id='delete-frame'>
                <h2>DELETE ACCOUNT</h2>
                    <p>Enter your password to delete your account : </p>
                    <form id='delete-form' onInput={handleInputDelete} onSubmit={(e)=>handleSubmitDelete(e)}>
                        <input type='password' name='delete-input' id='delete-form-password-input'></input>
                        <button id='delete-form-password-button'>DELETE</button>
                        <p className='form-error' id='delete-account-error'>Error, deletion failed !</p>
                    </form>
                </div>
            </div>
        );
    }
    return (
        <div>Loading...</div>
    );
}