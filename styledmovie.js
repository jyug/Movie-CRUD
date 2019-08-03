// Global variables and initializations

export var movieList = [];
export var curLoad = 0;

//added temp access token
//const atoken = "ufVj4Aymv4wyCjwEyp7pKsSkrQiLwLh4QTEv5XEGk1KMaASKMTJxD5zvgqrRemde";
var userLoginInfoStr = localStorage.getItem("userLoginInfo");
var userLoginInfo = JSON.parse(userLoginInfoStr);
if (userLoginInfo == null){
  userLoginInfo = {id: "unauthorized", username: "Unauthorized User"};
  redirectUnauthorizedUser();
}
const atoken = userLoginInfo.id;
export const username = localStorage.getItem("userName");

// Library functions

/*
 * appendListNode(node, list, index)
 * Initialize a list node from given parameters and append to the DOM tree.
 * @param - node: an element in the movie array
 * @param - list: the document list
 * @param - index: the index of the element in the movie array
 */
export function appendListNode(node, list, index) {
  // Check for impossible coner case(bugs) and log
  if (node == null) {
    console.log('null element detected!');
    return;
  }
  if (node.title == null || node.year == null || node.rating == null) {
    console.log('null property detected!');
    console.log(node.title, node.yaer, node.genre, node.rating, node.userRating, node.image);
    return;
  }
  // Initalize the list node
  const template = document.getElementById('card-template');
  const listNode = template.content.cloneNode(true);
  const title = listNode.querySelector('.card-title');
  title.innerHTML = node.title;
  const year = listNode.querySelector('.card-year');
  year.innerHTML = `Released in ${node.year}`;
  const rating = listNode.querySelector('.card-rating');
  rating.innerHTML = `Rated ${node.rating}`;
  const genre = listNode.querySelector('.card-genre');
  genre.innerHTML = node.genre;
  const userRating = listNode.querySelector('.card-userRating');
  // userRating.innerHTML = `User Rating: ${node.userRating}`;
  for (var i = 0; i<node.userRating; i++){
    userRating.children[i].setAttribute("class", "fa fa-star checked");
  }
  const image = listNode.querySelector('.card-image');
  image.setAttribute("src", node.image);
  //image.innerHTML = node.image;
  // Finish the list node
  initializeListNodeButtons(index, listNode);
  listNode.querySelector('.card').setAttribute('id', `li-${index}`);
  list.appendChild(listNode);
}

/*
 * initializeListNodeButtons(index, node)
 * Initialize the edit and delete buttons of the list node with the given index
 * @param - node: an element in the movie array
 * @param - index: the index of the element in the movie array
 */
export function initializeListNodeButtons(index, node) {
  // Initialize the Edit Button
  const editButton = node.querySelector('.button-edit');
  editButton.setAttribute('onclick', `edit(${index})`);
  // Initialize Remove Button
  const removeButton = node.querySelector('.button-remove');
  removeButton.setAttribute('onclick', `remove(${index})`);
}

/*
 * edit(index)
 * Preprocess and show the edit dialog.
 * @param - index: the index of the element in the movie array
 */
export function edit(index) {
  //make sure the fields are white
  let title = document.getElementById('title');
  let year = document.getElementById('year');
  let rating = document.getElementById('rating');
  let image = document.getElementById('image');
  title.style.borderColor = 'white';
  title.style.borderWidth = '1px';
  year.style.borderColor = 'white';
  year.style.borderWidth = '1px';
  rating.style.borderColor = 'white';
  rating.style.borderWidth = '1px';
  image.style.borderColor = 'white';
  image.style.borderWidth = '1px';
  // Preprocess the dialog
  var editSaveButton = document.getElementById('save');
  editSaveButton.setAttribute('onclick', `setContent(${index})`);
  // Get the current values
  const curTitle = movieList[index].title;
  const curYear = movieList[index].year;
  const curRating = movieList[index].rating;
  const curGenre = movieList[index].genre;
  const curUserRating = movieList[index].userRating;
  const curImage = movieList[index].image;
  document.getElementById('title').value = curTitle;
  document.getElementById('year').value = curYear;
  document.getElementById('rating').value = curRating;
  document.getElementById('genre').value = curGenre;
  document.getElementById('userRating').value = curUserRating;
  document.getElementById('image').value = curImage;
  // Show the dialog
  document.getElementById('edit-dialog').show();
}

/*
 * setContent(index)
 * Save the content values of a list node given user inputs
 * @param - index: the index of the element in the movie array
 */
export function setContent(index) {
  // Get user input
  let title = document.getElementById('title');
  let year = document.getElementById('year');
  let rating = document.getElementById('rating');
  let genre = document.getElementById('genre');
  let userRating = document.getElementById('userRating');
  let image = document.getElementById('image');
  // Check for empty input
  if (title.value == '' || year.value  == '' || rating.value  == '' || image.value  == '') {
    // Generate error message
    const errText = 'All fields are required.';
    document.getElementById('err').innerHTML = errText;
    if (title.value  == '') {
      title.style.borderColor = 'rgba(242, 88, 124, 0.60)';
      title.style.borderWidth = '3px';
    }
    if (year.value  == '') {
      year.style.borderColor = 'rgba(242, 88, 124, 0.60)';
      year.style.borderWidth = '3px';
    }
    if (rating.value  == '') {
      rating.style.borderColor = 'rgba(242, 88, 124, 0.60)';
      rating.style.borderWidth = '3px';
    }
    if (image.value  == '') {
      image.style.borderColor = 'rgba(242, 88, 124, 0.60)';
      image.style.borderWidth = '3px';
    }
    return;
  } else {
    if (userRating < 0 || userRating > 5) {
      const ratingErr = 'Please choose user rating from 0 to 5.';
    document.getElementById('err').innerHTML = ratingErr;
    return;
    }
    // Sanitize input
    title.value  = DOMPurify.sanitize(title.value );
    year.value  = DOMPurify.sanitize(year.value );
    rating.value  = DOMPurify.sanitize(rating.value );
    genre.value  = DOMPurify.sanitize(genre.value );
    userRating.value  = DOMPurify.sanitize(userRating.value );
    image.value  = DOMPurify.sanitize(image.value );
  }
  // Set Content in remote
  const listNodeCur = document.getElementById(`li-${index}`);
  // Check if the node exists
  var node;
  if (listNodeCur != null) {
    let id = movieList[index].id;
    node = {
      "title": title.value , "year": year.value , "rating": rating.value , "genre": genre.value ,
      "userRating": userRating.value , "image": image.value , "id": id
    };
    setContentRemote(node, index, true);
  } else {
    node = {
      "title": title.value , "year": year.value , "rating": rating.value , "genre": genre.value ,
      "userRating": userRating.value , "image": image.value 
    };
    setContentRemote(node, index, false);
  }
}

/*
 * setContentRemote(node)
 */
export function setContentRemote(node, index, editing) {
  let xhr = new XMLHttpRequest();
  var endpoint
  console.log(editing);
  if (editing) {
    console.log(node.id);
    endpoint = `http://introweb.tech/api/movies/${node.id}/replace?access_token=${atoken}`;
  } else {
    endpoint = `http://introweb.tech/api/movies?access_token=${atoken}`;
  }
  var params = typeof node == 'string' ? data : Object.keys(node).map(
    function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(node[k]) }
  ).join('&');
  xhr.open("POST", endpoint);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // Update the DOM differently when editing
      if (!editing) {
        // Update data structure
        movieList[index] = JSON.parse(this.responseText);
        console.log(movieList[index]);
        const list = document.getElementById('list');
        appendListNode(movieList[index], list, index);
      } else {
        loadMovieList(loadContent, Math.max(3,index+1));
      }
      // Colse and clear dialog
      document.getElementById('edit-dialog').close();
      clearDialog();
      // Save to browser storage
      saveMovieList();
    }
    else if (this.status != 200) {
      console.log(`Set content error: ${this.status}`);
    }
    else {
      console.log("request in progress!");
    }
  }
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(params);
}

/*
 * remove(index)
 * Preprocess and show the remove dialog
 * @param - index: the index of the element in the movie array
 */
export function remove(index) {
  // Preprocess dialog
  document.getElementById('ok-r').setAttribute('onclick', `removeContent(${index})`);
  // Show dialog
  document.getElementById('remove-dialog').show();
}

/*
 * removeContent(index)
 * Remove the element of given index from the movie array
 * @param - index: the index of the element in the movie array
 */
export function removeContent(index) {
  // Remove content on remote
  let xhr = new XMLHttpRequest();
  const endpoint = `http://introweb.tech/api/movies/${movieList[index].id}?access_token=${atoken}`;
  xhr.open("DELETE", endpoint);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      movieList.splice(index, 1);
      // Close dialog
      document.getElementById('remove-dialog').close();
      // Reload content
      saveMovieList();
      loadMovieList(loadContent, Math.max(3,index+1));
    } else if (this.status != 200) {
      console.log(`Delete error: ${this.status}`);
    }
    else {
      console.log("request in progress!");
    }
  }
  xhr.send();
}

/*
 * add(index)
 * Preprocess and show the add dialog.
 * @param - index: the index of the element in the movie array
 */
export function add() {
  //make sure the fields are white
  let title = document.getElementById('title');
  let year = document.getElementById('year');
  let rating = document.getElementById('rating');
  let image = document.getElementById('image');
  title.style.borderColor = 'white';
  title.style.borderWidth = '1px';
  year.style.borderColor = 'white';
  year.style.borderWidth = '1px';
  rating.style.borderColor = 'white';
  rating.style.borderWidth = '1px';
  image.style.borderColor = 'white';
  image.style.borderWidth = '1px';
  // Preprocess the dialog
  var editSaveButton = document.getElementById('save');
  editSaveButton.setAttribute('onclick', `setContent(${movieList.length})`);
  // Show the dialog
  document.getElementById('edit-dialog').show();
}

/*
 * loadContent
 * Update DOM from data in the movie array
 */
export function loadContent(num) {
  clearContent();
  const list = document.getElementById('list');
  num = Math.min(num, movieList.length);
  for (let i = 0; i < num; i++) {
    appendListNode(movieList[i], list, i);
  }
  curLoad = num;
}

/*
 * clearContent
 * Clear the DOM list
 */
export function clearContent() {
  const list = document.getElementById('list');
  let first = list.firstElementChild;
  while (first) {
    first.remove();
    first = list.firstElementChild;
  }
}

/*
 * saveMovieList
 * Save the movie array to browser internal storage
 * Called whtn the data structre is updated
 */
export function saveMovieList() {
  var listStr = JSON.stringify(movieList);
  localStorage.setItem('movieList-s', listStr);
}

/*
 * loadMovieList
 * Populate the movie array data structre from the api endpoints.
 * Called when page loads
 */
export function loadMovieList(callback, num) {
  var listStr;
  let xhr = new XMLHttpRequest();
  const endpoint = `http://introweb.tech/api/movies/movieList?access_token=${atoken}`;
  xhr.open("GET", endpoint);
  //xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhr.send();
  xhr.onreadystatechange = function () {
    //console.log(this.readyState);
    //console.log(this.status);
    if (this.readyState == 4 && this.status == 200) {
      listStr = xhr.responseText;
      if (listStr == null) {
        return;
      } else {
        movieList = JSON.parse(listStr);
      }
    } else {
      if (this.status != 200) {
        console.log("Error: could not access movie list!");
      } else {
        console.log("Request in progress!");
      }
    }

    // listStr = localStorage.getItem('movieList-s');

    if (listStr == null) {
      return;
    } else {
      movieList = JSON.parse(listStr);
      movieList = movieList.movies;
      callback(num);
    }
  }
}
/*
 * logout 
 */
export function logout() {
  let endpoint = `http://introweb.tech/api/Users/logout?access_token=${atoken}`;
  let xhr = new XMLHttpRequest();
  xhr.open('POST', endpoint, true);
  xhr.onreadystatechange = function () {
    localStorage.removeItem("userLoginInfo");
    window.location = "./signout.html";
  }
  xhr.send();
}

/*
 * redirectUnauthorizedUser
 * Hide the content and shows a notification of redirection instead
 * Redirect to login page 
 */
export function redirectUnauthorizedUser() {
  window.location.replace("./signup.html");
}

/*
 * clearDialog
 * Clear the dialog files
 */
export function clearDialog() {
  document.getElementById('title').value = '';
  document.getElementById('year').value = '';
  document.getElementById('rating').value = '';
  document.getElementById('genre').value = '';
  document.getElementById('userRating').value = '';
  document.getElementById('image').value = '';
  document.getElementById('err').innerHTML = '';
}


// // Executed on page load
// window.onload = function () {
//   // Callback on loadMovieList
//   document.getElementById("nav-username").innerHTML = `${username} `;
//   loadMovieList(loadContent);
//   document.getElementById('add-button').addEventListener('click', function () {
//     add();
//   });
  
//   document.getElementById('nav-login-control').addEventListener('click', function () {
//     logout();
//   });

//   document.getElementById('cancel-r').addEventListener('click', function () {
//     document.getElementById('remove-dialog').close();
//   });

//   document.getElementById('cancel').addEventListener('click', function () {
//     document.getElementById('edit-dialog').close();
//     clearDialog();
//   });
// }
