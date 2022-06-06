import axios from "axios";

const BASE_URL = "http://127.0.0.1:3000/api/"

export const GetProfile = (userId) => {

  const options = {
        headers: { Authorization: 'Bearer '+sessionStorage.getItem("token") }
    };
    return axios.get(BASE_URL + 'profiles/'+userId.id,options)
      .then((res) =>{
        console.log(res.data);
        return res.data;
        })
      .catch((err) => err);
}

export const GetProfilePosts = (userId) => {

  const options = {
      headers: { Authorization: 'Bearer '+sessionStorage.getItem("token") }
  };
  return axios.get(BASE_URL + 'profiles/'+userId.id+'/posts',options)
    .then((res) =>{
      return res.data;
      })
    .catch((err) => err);
}

export const SearchProfiles = (profiles) => {

  const options = {
        headers: { Authorization: 'Bearer '+sessionStorage.getItem("token") }
    };

    const bodyParameters = {
      userId : sessionStorage.getItem("userId"),
      profiles: profiles
  };

    return axios.post(BASE_URL + 'profiles/search',bodyParameters,options)
      .then((res) =>{
        return res.data;
        })
      .catch((err) => err);
}

export const TextSearchProfiles = (query) => {

  const options = {
        headers: { Authorization: 'Bearer '+sessionStorage.getItem("token") }
    };

    const bodyParameters = {
      userId : sessionStorage.getItem("userId"),
      query: query
  };

    return axios.post(BASE_URL + 'profiles/textsearch',bodyParameters,options)
      .then((res) =>{
        return res.data;
        })
      .catch((err) => err);
}

export const EditProfile = (profile,data=null) => {
  
    let fm = new FormData();
    fm.append('userId', sessionStorage.getItem("userId"));
    fm.append('firstname', profile.firstname);
    fm.append('lastname', profile.lastname);
    fm.append('description', profile.description);
    fm.append('access', profile.access);

    if(data !== null){
      fm.append('image', data);
    }

    return axios.put(BASE_URL + 'profiles/'+profile.userId,fm,{
      headers: {
       Authorization: 'Bearer '+sessionStorage.getItem("token") }
    })
      .then((res) =>{
        return res.data;
        })
      .catch((err) => err);
}