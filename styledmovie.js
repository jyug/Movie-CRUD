// Global variables and initializations

var movieList = [];

//added temp access token
//const atoken = "ufVj4Aymv4wyCjwEyp7pKsSkrQiLwLh4QTEv5XEGk1KMaASKMTJxD5zvgqrRemde";
var userLoginInfoStr = localStorage.getItem("userLoginInfo");
var userLoginInfo = JSON.parse(userLoginInfoStr);
if (userLoginInfo == null){
  userLoginInfo = {id: "unauthorized"};
  redirectUnauthorizedUser();
}
const atoken = userLoginInfo.id;

// Library functions

/*
 * appendListNode(node, list, index)
 * Initialize a list node from given parameters and append to the DOM tree.
 * @param - node: an element in the movie array
 * @param - list: the document list
 * @param - index: the index of the element in the movie array
 */
function appendListNode(node, list, index) {
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
  const title = listNode.querySelector('#card-title');
  title.innerHTML = node.title;
  const year = listNode.querySelector('#card-year');
  year.innerHTML = node.year;
  const rating = listNode.querySelector('#card-rating');
  rating.innerHTML = node.rating;
  const genre = listNode.querySelector('#card-genre');
  genre.innerHTML = node.genre;
  const userRating = listNode.querySelector('#card-userRating');
  userRating.innerHTML = node.userRating;
  const image = listNode.querySelector('#card-image');
  image.innerHTML = node.image;
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
function initializeListNodeButtons(index, node) {
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
function edit(index) {
  // Preprocess the dialog
  editSaveButton = document.getElementById('save');
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
function setContent(index) {
  // Get user input
  let title = document.getElementById('title').value;
  let year = document.getElementById('year').value;
  let rating = document.getElementById('rating').value;
  let genre = document.getElementById('genre').value;
  let userRating = document.getElementById('userRating').value;
  let image = document.getElementById('image').value;
  // Check for empty input
  if (title == '' || year == '' || rating == '' || image == '') {
    // Generate error message
    const errText = 'All fields are required.';
    document.getElementById('err').innerHTML = errText;
    return;
  } else {
    if (userRating < 0 || userRating > 5) {
      const ratingErr = 'Please choose user rating from 0 to 5.';
    document.getElementById('err').innerHTML = ratingErr;
    return;
    }
    // Sanitize input
    title = DOMPurify.sanitize(title);
    year = DOMPurify.sanitize(year);
    rating = DOMPurify.sanitize(rating);
    genre = DOMPurify.sanitize(genre);
    userRating = DOMPurify.sanitize(userRating);
    image = DOMPurify.sanitize(image);
  }
  // Set Content in remote
  const listNodeCur = document.getElementById(`li-${index}`);
  // Check if the node exists
  var node;
  if (listNodeCur != null) {
    let id = movieList[index].id;
    node = {
      "title": title, "year": year, "rating": rating, "genre": genre,
      "userRating": userRating, "image": image, "id": id
    };
    setContentRemote(node, index, true);
  } else {
    node = {
      "title": title, "year": year, "rating": rating, "genre": genre,
      "userRating": userRating, "image": image
    };
    setContentRemote(node, index, false);
  }
}

/*
 * setContentRemote(node)
 */
function setContentRemote(node, index, editing) {
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
        loadMovieList(loadContent);
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
function remove(index) {
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
function removeContent(index) {
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
      loadMovieList(loadContent);
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
function add() {
  // Preprocess the dialog
  editSaveButton = document.getElementById('save');
  editSaveButton.setAttribute('onclick', `setContent(${movieList.length})`);
  // Show the dialog
  document.getElementById('edit-dialog').show();
}

/*
 * loadContent
 * Update DOM from data in the movie array
 */
function loadContent() {
  clearContent();
  const list = document.getElementById('list');
  console.log(movieList);
  for (let i = 0; i < movieList.length; i++) {
    appendListNode(movieList[i], list, i);
  }
}

/*
 * clearContent
 * Clear the DOM list
 */
function clearContent() {
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
function saveMovieList() {
  listStr = JSON.stringify(movieList);
  localStorage.setItem('movieList-s', listStr);
}

/*
 * loadMovieList
 * Populate the movie array data structre from the api endpoints.
 * Called when page loads
 */
function loadMovieList(callback) {
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
        console.log(listStr);
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
      console.log(movieList);
      callback();
    }
  }
}
/*
 * logout 
 */
function logout() {
  let endpoint = `http://introweb.tech/api/Users/logout?access_token=${atoken}`;
  let xhr = new XMLHttpRequest();
  xhr.open('POST', endpoint, true);
  xhr.onload = function () {
  window.location = "./signout.html";
  }
  xhr.send();
}

/*
 * redirectUnauthorizedUser
 * Hide the content and shows a notification of redirection instead
 * Redirect to login page 
 */
function redirectUnauthorizedUser() {
  window.location.replace("./signup.html");
}

/*
 * clearDialog
 * Clear the dialog files
 */
function clearDialog() {
  document.getElementById('title').value = '';
  document.getElementById('year').value = '';
  document.getElementById('rating').value = '';
  document.getElementById('genre').value = '';
  document.getElementById('userRating').value = '';
  document.getElementById('image').value = '';
  document.getElementById('err').innerHTML = '';
}

// Executed on page load
window.onload = function () {
  // Callback on loadMovieList
  loadMovieList(loadContent);
  document.getElementById('add-button').addEventListener('click', function () {
    add();
  });
  
  document.getElementById('signoutBtn').addEventListener('click', function () {
    logout();
  });

  document.getElementById('cancel-r').addEventListener('click', function () {
    document.getElementById('remove-dialog').close();
  });

  document.getElementById('cancel').addEventListener('click', function () {
    document.getElementById('edit-dialog').close();
    clearDialog();
  });
}
