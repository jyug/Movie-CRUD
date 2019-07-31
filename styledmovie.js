// Global variables and initializations

var movieList = [];
movieList.push(['Star Wars', '1977', 'PG']);
movieList.push(['The Empire Strikes Back', '1980', 'PG']);
movieList.push(['The Revenge of the Jedi', '1983', 'PG']);

//added temp access token
const atoken = "ufVj4Aymv4wyCjwEyp7pKsSkrQiLwLh4QTEv5XEGk1KMaASKMTJxD5zvgqrRemde";

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
  if (node[0] == null || node[1] == null || node[2] == null) {
    console.log('null property detected!');
    console.log(node[0], node[1], node[2]);
    return;
  }
  // Initalize the list node
  const template = document.getElementById('card-template');
  const listNode= template.content.cloneNode(true);
  const title = listNode.querySelector('#card-title');
  title.innerHTML = node[0];
  const year = listNode.querySelector('#card-year');
  year.innerHTML = node[1];
  const rating = listNode.querySelector('#card-rating');
  rating.innerHTML = node[2];
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
  const curTitle = movieList[index][0];
  const curYear = movieList[index][1];
  const curRating = movieList[index][2];
  document.getElementById('title').value = curTitle;
  document.getElementById('year').value = curYear;
  document.getElementById('rating').value = curRating;
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
  // Check for empty input
  if (title == '' || year == '' || rating == '') {
    // Generate error message
    const errText = 'All fields are required.';
    document.getElementById('err').innerHTML = errText;
    return;
  } else {
    // Sanitize input
    title = DOMPurify.sanitize(title);
    year = DOMPurify.sanitize(year);
    rating = DOMPurify.sanitize(rating);
  }
  // Update data structure
  movieList[index] = [title, year, rating];
  const listNodeCur = document.getElementById(`li-${index}`);
  // Check if the node exists
  if (listNodeCur == null) {
    const list = document.getElementById('list');
    appendListNode(movieList[index], list, index);
  } else {
    // Update DOM
    // listNodeCur.innerText = `${title} (${year}) - Rated: ${rating}`;
    // initializeListNodeButtons(index, listNodeCur);
    loadContent();
  }
  // Colse and clear dialog
  document.getElementById('edit-dialog').close();
  clearDialog();
  // Save to browser storage
  saveMovieList();
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
  // Remove content
  movieList.splice(index, 1);
  // Close dialog
  document.getElementById('remove-dialog').close();
  // Reload content
  saveMovieList();
  loadContent();
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
 * Populate the movie array data structre from browser internal storage
 * Called when page loads
 */
function loadMovieList() {
  var listStr;
  let xhr = new XMLHttpRequest();
  const endpoint = `http://introweb.tech/api/movies/movieList?access_token=${atoken}`;
  xhr.open("GET", endpoint);
  //xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhr.send();
  xhr.onreadystatechange = function() {
    //console.log(this.readyState);
    //console.log(this.status);
    if(this.readyState == 4 && this.status == 200) {
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
    console.log(movieList);
  }
}

/*
 * clearDialog
 * Clear the dialog files
 */
function clearDialog() {
  document.getElementById('title').value = '';
  document.getElementById('year').value = '';
  document.getElementById('rating').value = '';
  document.getElementById('err').innerHTML = '';
}

// Executed on page load
window.onload = function() {
  loadMovieList();
  loadContent();
  document.getElementById('add-button').addEventListener('click', function() {
    add();
  });

  document.getElementById('cancel-r').addEventListener('click', function() {
    document.getElementById('remove-dialog').close();
  });

  document.getElementById('cancel').addEventListener('click', function() {
    document.getElementById('edit-dialog').close();
    clearDialog();
  });
};
