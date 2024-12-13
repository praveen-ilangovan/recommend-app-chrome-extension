
// Constants
const AUTH_ENDPOINT = "http://127.0.0.1:8000/extension/token";

const getUserDataFromStorage = async () => {
    const syncObj = await chrome.storage.sync.get(["recommendAppUserData"]);
    return syncObj.recommendAppUserData
}

// Get Verified User
export const getVerifiedUser = async () => {
    let verifiedUser = undefined;

    // See if there is an access token
    const userDataFromStorage = await getUserDataFromStorage();
    if (userDataFromStorage === undefined) {
        return verifiedUser;
    }

    // Call the endpoint of the app.
    try {
        const response = await fetch(AUTH_ENDPOINT, {
            method: "GET",
            headers: {
                "UserAuthData": JSON.stringify(userDataFromStorage)
            }
        });

        if (response.ok) {
            verifiedUser = await response.json();
            chrome.storage.sync.set({recommendAppUserData: verifiedUser.user});
            return verifiedUser;
        } else {
            // Handle error
            const errorData = await response.json();
            console.error("Error:", errorData.detail.error);
            logout();
            return verifiedUser;
        }
        } catch (error) {
            console.error("Error:", error);
            return verifiedUser;
        }
}

// Login
export const login = async (username, password) => {

    const loginCredentials = [['username', username], ['password', password]];
    const payload = new URLSearchParams();
    for (const [key, value] of loginCredentials) {
      payload.append(key, value);
    }

    try {
      const response = await fetch(AUTH_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        // Set the access token!!
        chrome.storage.sync.set({recommendAppUserData: data});
        return true;

      } else {
        // Handle error
        const errorData = await response.json();
        console.error("Error:", errorData.detail.error);
        alert(`Error: ${errorData.detail.error}`);
      }
    } catch (error) {
        console.error("Error:", error);
        alert(error);
    }
}

// Logout
export const logout = () => {
    chrome.storage.sync.clear();
}

// Add Card
export const addCard = async (title, description, board_id) => {

    // See if there is an access token
    const userDataFromStorage = await getUserDataFromStorage();
    if (userDataFromStorage === undefined) {
        return {'error': 'Please sign in'};
    }

    // Get the card info
    const sessionObj = await chrome.storage.session.get(["card"]);
    if (sessionObj.card === undefined) {
        return {'error': 'Failed to fetch the card data'};
    }
    const payload = {'title': title,
                     'description': description,
                     'url': sessionObj.card.url,
                     'thumbnail': sessionObj.card.thumbnail};
 
    const url = "http://127.0.0.1:8000/extension/" + board_id + "/cards";

    try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "UserAuthData": JSON.stringify(userDataFromStorage)
          },
          body: JSON.stringify(payload),
        });
  
        if (response.ok) {
            const data = await response.json();
            return {'card': data}
        } else {
          // Handle error
          const errorData = await response.json();
          return {'error': errorData.detail.error};
        }
      } catch (error) {
        return {'error': error};
      }
}
