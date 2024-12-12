import { getAuthenticatedUser, login, logout } from "../app/auth.js";

document.addEventListener("DOMContentLoaded", async function() {

    // Event Listeners
    const loginButton = document.getElementById("loginButton");
    loginButton.addEventListener('click', async() => {
        const username = document.getElementById("usernameField").value;
        const password = document.getElementById("passwordField").value;

        const result = await login(username, password);
        if (result) {
            const authenticatedUser = await getAuthenticatedUser();
            if (authenticatedUser) {
                showCardSection(authenticatedUser);
            }
        }
    });

    const logoutLink = document.getElementById("logoutLink");
    logoutLink.addEventListener('click', () => {
        logout();
        showLoginSection();
    });

    // Display the contents
    const authenticatedUser = await getAuthenticatedUser();
    if (authenticatedUser) {
        showCardSection(authenticatedUser);
    } else {
        showLoginSection();
    }
});


const showLoginSection = () => {
    document.getElementById("loginSection").style.display = 'block';
    document.getElementById("cardSection").style.display = 'none';

    document.getElementById("userGreeting").style.display = 'none';
    document.getElementById("userGreeting").value = '';
}

const showCardSection = (authenticatedUser) => {
    document.getElementById("loginSection").style.display = 'none';
    document.getElementById("cardSection").style.display = 'block';

    document.getElementById("userGreeting").style.display = 'block';
    document.getElementById("userGreeting").innerText = 'Hi, ' + authenticatedUser.first_name;
}

const getUrlInfo = () => {
    // Get the active tab
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {

        // Send a message to the active tab
        chrome.tabs.sendMessage(tabs[0].id, {data: "hello"}, response => {

            // Error??
            if (chrome.runtime.lastError) {
                alert("ERROR: ", chrome.runtime.lastError);
            }

            if (response) {
                const titleField = document.getElementById("titleField");
                titleField.value = response.data.title;

                const thumbnailField = document.getElementById("thumbnailField");
                thumbnailField.value = response.data.thumbnail;

                const descriptionField = document.getElementById("descriptionField");
                descriptionField.value = response.data.description;

                // Set the image
                const thumbnail = document.getElementById("thumbnail");
                thumbnail.src = response.data.thumbnail;
            }

        });

    });
};
