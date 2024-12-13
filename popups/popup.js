import { getVerifiedUser, login, logout, addCard } from "../app/auth.js";

document.addEventListener("DOMContentLoaded", async function() {

    // Event Listeners
    const loginButton = document.getElementById("loginButton");
    loginButton.addEventListener('click', async() => {
        const username = document.getElementById("usernameField").value;
        const password = document.getElementById("passwordField").value;

        const result = await login(username, password);
        if (result.type === 'ok') {
            const verifiedUserResult = await getVerifiedUser();
            if (verifiedUserResult.type === 'ok') {
                showCardSection(verifiedUserResult.user);
            } else {
                showMessageBox(verifiedUserResult.type, verifiedUserResult.msg);
            }
        } else {
            showMessageBox(result.type, result.msg);
        }
    });

    const logoutLink = document.getElementById("logoutLink");
    logoutLink.addEventListener('click', () => {
        logout();
        showLoginSection();
    });

    const addCardButton = document.getElementById("addCardButton");
    addCardButton.addEventListener('click', async () => {
        const title = document.getElementById("titleField").value;
        const description = document.getElementById("descriptionField").value;
        const boardId = document.getElementById("boardsDropDown").value;
        const response = await addCard(title, description, boardId);
        showMessageBox(response.type, response.msg);
    })

    const goBackLink = document.getElementById("goBackLink");
    goBackLink.addEventListener('click', startup);

    // Start Up
    await startup();
});

const startup = async () => {
    const result = await getVerifiedUser();
    if (result.type === 'ok') {
        showCardSection(result.user);
    } else {
        showLoginSection();
    }
}


const showLoginSection = () => {
    document.getElementById("cardSection").style.display = 'none';
    document.getElementById("successMsgBox").style.display = 'none';
    document.getElementById("errorMsgBox").style.display = 'none';
    document.getElementById("goBackBox").style.display = 'none';

    document.getElementById("loginSection").style.display = 'block';
    document.getElementById("userGreeting").style.display = 'none';
    document.getElementById("userGreeting").value = '';
}

const showCardSection = (verifiedUser) => {
    document.getElementById("loginSection").style.display = 'none';
    document.getElementById("successMsgBox").style.display = 'none';
    document.getElementById("errorMsgBox").style.display = 'none';
    document.getElementById("goBackBox").style.display = 'none';
    
    document.getElementById("cardSection").style.display = 'block';
    document.getElementById("userGreeting").style.display = 'block';
    document.getElementById("userGreeting").innerText = 'Hi, ' + verifiedUser.user.first_name;

    populateUrlInfo();
    populateBoards(verifiedUser.boards);
}

const populateUrlInfo = () => {
    // Get the active tab
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {

        // [TODO] Skip if the url is chrome specific ones

        // Send a message to the active tab
        chrome.tabs.sendMessage(tabs[0].id, {data: "hello"}, response => {

            // Error??
            if (chrome.runtime.lastError) {
                alert("ERROR: ", chrome.runtime.lastError);
            }

            if (response) {
                // Store the url in the session data
                chrome.storage.session.set({card: response.data});

                const titleField = document.getElementById("titleField");
                titleField.value = response.data.title;

                const descriptionField = document.getElementById("descriptionField");
                descriptionField.value = response.data.description;

                // Set the image
                const thumbnail = document.getElementById("thumbnail");
                thumbnail.src = response.data.thumbnail;
            }

        });

    });
};

const populateBoards = (boards) => {
    removeBoards();
    const boardsDropDown = document.getElementById("boardsDropDown");
    for (const board of boards) {
        const option = document.createElement("option");
        option.value = board.id;
        option.text = board.name;
        boardsDropDown.add(option);
    }
}

const removeBoards = () => {
    const boardsDropDown = document.getElementById("boardsDropDown");
    const numOfOptions = boardsDropDown.options.length;
    for (let i=numOfOptions-1; i >= 0 ; i--) {
        boardsDropDown.remove(i);
    }
}

const showMessageBox = (msgType, msg) => {
    // Turn off the other sections
    document.getElementById("cardSection").style.display = 'none';
    document.getElementById("loginSection").style.display = 'none';

    const successBox = document.getElementById("successMsgBox");
    const successMsgSlot = document.getElementById("successMsgSlot");
    const errorBox = document.getElementById("errorMsgBox");
    const errorMsgSlot = document.getElementById("errorMsgSlot");

    document.getElementById("goBackBox").style.display = 'block';

    if (msgType === 'ok') {
        errorBox.style.display = 'none';
        successBox.style.display = 'block';
        successMsgSlot.innerText = msg;
    } else {
        successBox.style.display = 'none';
        errorBox.style.display = 'block';
        errorMsgSlot.innerText = msg;
    }
}
