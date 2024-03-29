/*
 * switches between sign in and sign up window
 */
export function switchWindow(vis, hid) {
  document.getElementById(vis).style.visibility = 'visible';
  document.getElementById(hid).style.visibility = 'hidden';
}

const apiURL = 'https://introweb.tech/api';
const moviePage = './styledcrud.html';

//window.addEventListener("onload", function () {signupAjax();});
export function formRequest(signup) {
  let endpoint;
  let formData;
  let payloadParam;
  let payload;
  let resultStr;
  const errText = 'All fields are required.';
  let reqErr = false;
  const xhr = new XMLHttpRequest();
  let userName;

  if (signup == true) {
    endpoint = `${apiURL}/Users`;
    xhr.open('POST', endpoint, true);
    formData = new FormData(document.querySelector('#signupForm'));
    payloadParam = new URLSearchParams(formData);
    payloadParam.forEach(function(value, key) {
        console.log(payloadParam);
      value = DOMPurify.sanitize(value);
      if (value == '' || value == null) {
        reqErr = true;
      }
    });
    if (reqErr) {
      document.getElementById('reqSignUpErr').innerHTML = errText;
      var i;
      for (i = 1; i<4; i++) {
        const x = `input${i}`;
        const field = document.getElementById(x);
        if (field.value == '') {
          field.style.borderColor = 'rgb(242, 88, 124)';
          field.style.borderWidth = '3px';
        }
      }
      return;
    }
    payload = payloadParam.toString();
    xhr.onload = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        resultStr = xhr.responseText;
        switchWindow('signin', 'signup');
      }else {
        document.getElementById('reqSignUpErr').innerHTML = 'Account with username already exist.';
      }
    };
  } else {
    endpoint = `${apiURL}/Users/login`;
    xhr.open('POST', endpoint, true);
    formData = new FormData(document.querySelector('#signinForm'));
    payloadParam = new URLSearchParams(formData);
    payloadParam.forEach(function(value, key) {
      value = DOMPurify.sanitize(value);
      if (value == '' || value == null) {
        reqErr = true;
      }
      if (key == 'username') {
        userName = value;
        localStorage.setItem('userName', userName);
      }
    });
    if (reqErr) {
      document.getElementById('reqSignInErr').innerHTML = errText;
      var i;
      for (i = 4; i<6; i++) {
        const x = `input${i}`;
        const field = document.getElementById(x);
        if (field.value == '') {
          field.style.borderColor = 'rgb(242, 88, 124)';
          field.style.borderWidth = '3px';
        }
      }
      return;
    }
    payload = payloadParam.toString();
    xhr.onload = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        resultStr = xhr.responseText;
        localStorage.setItem('userLoginInfo', resultStr);
        window.location = moviePage;
      } else {
        document.getElementById('reqSignInErr').innerHTML = 'Incorrect username or password.';
      }
    };
  }
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=utf-8');
  xhr.send(payload);
}
