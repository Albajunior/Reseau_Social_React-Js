import axios from "axios";

const BASE_URL = "http://127.0.0.1:3000/api/"

export const GetPosts = (topic) => {
  const options = {
      headers: { Authorization: 'Bearer '+sessionStorage.getItem("token") }
  };
  
  return axios.get(BASE_URL + 'posts/topic/'+topic,options)
      .then((res) => {return res.data;})
      .catch((err) => err)
}

export const GetTopics = () => {
  
  const options = {
    headers: { Authorization: 'Bearer '+sessionStorage.getItem("token") }
};

return axios.get(BASE_URL + 'posts/topics',options)
    .then((res) => {return res.data;})
    .catch((err) => err)
}

export const PostPost = (text,topic,data=null) => {

  const options = {
    headers:{
    Authorization: 'Bearer '+sessionStorage.getItem("token")
    }
  };

  let fm = new FormData();
  fm.append('userId', sessionStorage.getItem("userId"));
  fm.append("content",text);
  fm.append("topic", topic);

  if(data !== null){
    fm.append('image', data);
  }
  return axios.post(BASE_URL + 'posts',fm,options)
      .then((res) => console.log(res.data))
      .catch((err) => err)
}

export const DelPost = (postId) =>{

  return axios.delete(BASE_URL + 'posts/'+postId+"",{
      headers: { Authorization: 'Bearer '+sessionStorage.getItem("token") },
      data:{
          userId : sessionStorage.getItem("userId")
      }
  })
  .then((res) => console.log(res.data))
  .catch((err) => err)
}

export const LikePost = (postId,like) => {

  const options = {
    headers:{
    Authorization: 'Bearer '+sessionStorage.getItem("token")
  }
};
const bodyParameters = {
    userId : sessionStorage.getItem("userId"),
    like: like
};
  
  return axios.post(BASE_URL + 'posts/'+postId+"/like",bodyParameters,options)
      .then((res) => console.log(res.data))
      .catch((err) => err)
}