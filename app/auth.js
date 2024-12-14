
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
        return {'type':'error', 'msg': 'Please sign in'}
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
            return {'type':'ok', 'msg': 'User authorized', 'user': verifiedUser};
        } else {
            // Handle error
            const errorData = await response.json();
            logout();
            return {'type':'error', 'msg': errorData.detail.error};
        }
        } catch (error) {
            return {'type':'error', 'msg': error};
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
        return {'type':'ok', 'msg': 'User logged in'};
      } else {
        // Handle error
        const errorData = await response.json();
        return {'type':'error', 'msg': errorData.detail.error};
      }
    } catch (error) {
        return {'type':'error', 'msg': error};
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
        return {'type':'error', 'msg': 'Please sign in'};
    }

    // Get the card info
    const sessionObj = await chrome.storage.session.get(["card"]);
    if (sessionObj.card === undefined) {
        return {'type':'error', 'msg': 'Failed to fetch the card data'};
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
            return {'type':'ok', 'msg': 'Card added successfully', 'card': data}
        } else {
          // Handle error
          const errorData = await response.json();
          return {'type':'error', 'msg': errorData.detail.error}
        }
      } catch (error) {
        return {'type':'error', 'msg': error}
      }
}
