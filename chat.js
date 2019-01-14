/* https://github.com/vipinkrishna */

const chatList = document.querySelector('#chat-list');
const messageForm = document.querySelector('#send-form');

let chats=[];
let filteredChats=[];

//SEARCH FILTER
const search = document.querySelector('#search');
search.addEventListener('input', (e) => {
    let value = e.target.value; //YOU CAN USE search.value
    if(value.length > 0) {
        searchFilter(value);
    } else {
        chatList.innerHTML = '';  //EMPTY DOM LIST
        chats.forEach(doc => renderUser(doc));
    }
});

//SEARCH FILTER
function searchFilter(value) {
    const regex = new RegExp(`${value}`, 'i');
    filteredChats = chats.filter(doc => !Object.keys(doc.data()).every(key => regex.test(doc.data()[key]) ? false: true))
    chatList.innerHTML = '';  //EMPTY DOM LIST
    filteredChats.forEach(doc => renderUser(doc));
}


// CREATE CHAT LIST
function renderUser(doc) {

    let li = document.createElement('li');
    let message = document.createElement('span');
    let close = document.createElement('div');

    li.setAttribute('data-id', doc.id);
    message.textContent = doc.data().message;
    close.textContent = 'x';

    li.appendChild(message);
    li.appendChild(close);

    chatList.appendChild(li);

    
    // DELETE CHAT
    close.addEventListener('click', (e) => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');

        db.collection('chats').doc(id).delete();

    });
}


// CREATE A MESSAGE
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    db.collection('chats').add({
        message: messageForm.message.value
    });
    messageForm.message.value = '';

    messageForm.message.focus();
});


// REALTIME EVENT HANDLING
db.collection('chats').orderBy('message').onSnapshot(snapshot => {
    
    chats = snapshot.docs;
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if (change.type == 'added') {
            renderUser(change.doc);
            searchFilter(search.value);  //CALL SEARCH FILTER
        } else if (change.type == 'removed') {
            let li = chatList.querySelector('[data-id="' + change.doc.id + '"]');
            chatList.removeChild(li);
        }
    });
});
