document.addEventListener("DOMContentLoaded", async function() {

    // logout();

    // Check if the user is logged in.
    const accessToken = await getAccessToken();
    if (accessToken.recommendAppAccessToken) {
        document.getElementById("titleField").value = accessToken.recommendAppAccessToken;
    }

    // 
    const loginButton = document.getElementById("loginButton");
    loginButton.addEventListener('click', login);
    
    // Attach an eventListener to the button
    const getUrlButton = document.getElementById("getUrlButton");
    getUrlButton.addEventListener('click', getUrlInfo);

    // Attach an eventListener to the button
    const addButton = document.getElementById("addButton");
    addButton.addEventListener('click', testFunc);
});

const testFunc = async () => {
    const endpoint = "http://127.0.0.1:8000/session/token";
    const accessToken = await getAccessToken();
    const bearer = 'Bearer ' + accessToken.recommendAppAccessToken;

    try {
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
              "Authorization": bearer
            }
          });
  
        if (response.ok) {
          const data = await response.json();
          alert(data.user_name);
        } else {
          // Handle error
          const errorData = await response.json();
          alert(`Error: ${errorData.detail.error}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert(error);
      }
}

const login = async () => {

    const endpoint = "http://127.0.0.1:8000/session/token";
    const formData = [['username', 'praveen'], ['password', 'test123']];

    const payload = new URLSearchParams();
    for (const [key, value] of formData) {
      payload.append(key, value);
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.access_token);

        // Set the access token!!
        chrome.storage.sync.set({
            recommendAppAccessToken: data.access_token,
        });

      } else {
        // Handle error
        const errorData = await response.json();
        alert(`Error: ${errorData.detail.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error);
    }
}

const logout = () => {
    chrome.storage.sync.clear();
};

// const login = async () => {
//     const endpoint = "http://127.0.0.1:8000/cards/67519a936f2b63ddc7239bab?show_page=false";

//     try {
//         const response = await fetch(endpoint);
    
//         if (response.ok) {
//           // Fill the form
//           const card = await response.json();
    
//         //   document.getElementById("url").value = card["url"];
//           document.getElementById("titleField").value = card["title"];
//           document.getElementById("descriptionField").value = card["description"];
//           document.getElementById("thumbnailField").value = card["thumbnail"];
//         } else {
//           // Handle error
//           const errorData = await response.json();
//           alert(`Error: ${errorData.detail.error}`);
//         }
//       } catch (error) {
//         console.error("Error:", error);
//         alert("An error occurred. Please try again.");
//       }
// };

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

const getAccessToken = async () => {
    // chrome.storage.sync.clear(); // callback is optional
    // chrome.storage.sync.set({recommendAppAccessToken: "Hello"});
    return await chrome.storage.sync.get(['recommendAppAccessToken']);
}
