'use strict';
export let  defaultURL = "http://localhost:3001"
// export let  defaultURL = "https://api.waysfl.com"

export function logout(){
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user")
  localStorage.removeItem("store")
  window.location.replace("#/login")
}

export function userData(){
  return JSON.parse(localStorage.getItem("user"))
}

export function userStore(){
  return JSON.parse(localStorage.getItem("store"))
}

export function setUser(val){
  return localStorage.setItem("user", JSON.stringify(val))
}
