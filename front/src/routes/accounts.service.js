import axios from "axios";

const BASE_URL = "http://127.0.0.1:3000/api/secure/"

export const GetUser = (userId) => {

  const options = {
        headers: { Authorization: 'Bearer '+sessionStorage.getItem("token") }
    };

    return axios.get(BASE_URL + 'users/'+userId,options)
      .then((res) =>{
        return res.data;
        })
      .catch((err) => err);
}

export const EditUserPassword = (oldPassword,newPassword) => {

  const options = {
        headers: { Authorization: 'Bearer '+sessionStorage.getItem("token") }
    };

    const bodyParameters = {
      userId : sessionStorage.getItem("userId"),
      oldPassword : oldPassword,
      newPassword : newPassword
  };

  return axios.put(BASE_URL + 'users/'+sessionStorage.getItem("userId")+"/changePassword",bodyParameters,options)
      .then((res) =>{
        return res;
        })
      .catch((err) => err);
}

export const EditUserEmail = (email) => {

  const options = {
        headers: { Authorization: 'Bearer '+sessionStorage.getItem("token") }
    };

    const bodyParameters = {
      userId : sessionStorage.getItem("userId"),
      newEmail : email
  };

  return axios.put(BASE_URL + 'users/'+sessionStorage.getItem("userId")+"/changeEmail",bodyParameters,options)
      .then((res) =>{
        return res;
        })
      .catch((err) => err);
}

export const DeleteUser = (password) => {

  return axios.delete(BASE_URL + 'users/'+sessionStorage.getItem("userId")+"/",{ 
    headers: { Authorization: 'Bearer '+sessionStorage.getItem("token") },
    data:{
        userId : sessionStorage.getItem("userId"),
        password: password
    }
  })
      .then((res) =>{
        return res;
        })
      .catch((err) => err);
}