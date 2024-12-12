import { getVerifiedUser, login, logout } from "../app/auth.js";

document.addEventListener("DOMContentLoaded", async function() {

    // Event Listeners
    const loginButton = document.getElementById("loginButton");
    loginButton.addEventListener('click', async() => {
        const username = document.getElementById("usernameField").value;
        const password = document.getElementById("passwordField").value;

        const result = await login(username, password);
        if (result) {
            const verifiedUser = await getVerifiedUser();
            if (verifiedUser) {
                showCardSection(verifiedUser);
            }
        }
    });

    const logoutLink = document.getElementById("logoutLink");
    logoutLink.addEventListener('click', () => {
        logout();
        showLoginSection();
    });

    // Display the contents
    const verifiedUser = await getVerifiedUser();
    if (verifiedUser) {
        showCardSection(verifiedUser);
    } else {
        showLoginSection();
    }
});


const showLoginSection = () => {
    document.getElementById("cardSection").style.display = 'none';

    document.getElementById("loginSection").style.display = 'block';
    document.getElementById("userGreeting").style.display = 'none';
    document.getElementById("userGreeting").value = '';
}

const showCardSection = (verifiedUser) => {
    document.getElementById("loginSection").style.display = 'none';
    
    document.getElementById("cardSection").style.display = 'block';
    document.getElementById("userGreeting").style.display = 'block';
    document.getElementById("userGreeting").innerText = 'Hi, ' + verifiedUser.name;

    populateUrlInfo();
    populateBoards(verifiedUser.boards);
}

const populateUrlInfo = () => {
    // Get the active tab
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {

        // Send a message to the active tab
        chrome.tabs.sendMessage(tabs[0].id, {data: "hello"}, response => {

            // Error??
            if (chrome.runtime.lastError) {
                alert("ERROR: ", chrome.runtime.lastError);
            }

            if (response) {
                // Store the url in the session data
                chrome.storage.session.set({
                    cardThumbnail: response.data.thumbnail,
                    cardURL: response.data.url,
                    cardTitle: response.data.title,
                    cardDescription: response.data.description
                 });

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
