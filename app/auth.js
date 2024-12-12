
// Constants
const AUTH_ENDPOINT = "http://127.0.0.1:8000/session/token";

// GetAccessToken
const getAccessToken = async () => {
    const syncObj = await chrome.storage.sync.get(["recommendAppAccessToken"]);
    return syncObj.recommendAppAccessToken
}


// Get Authenticated User
export const getAuthenticatedUser = async () => {
    let authenticatedUser = undefined;

    // See if there is an access token
    const accessToken = await getAccessToken();
    if (accessToken === undefined) {
        return authenticatedUser;
    }

    // Call the endpoint of the app.
    try {
        const response = await fetch(AUTH_ENDPOINT, {
            method: "GET",
            headers: {
                "Authorization": 'Bearer ' + accessToken
            }
            });

        if (response.ok) {
            authenticatedUser = await response.json();
            
            // Set the user information
            chrome.storage.session.set({ userID: authenticatedUser.id });
            chrome.storage.session.set({ userFirstName: authenticatedUser.first_name });

            return authenticatedUser;
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
        chrome.storage.sync.set({recommendAppAccessToken: data.access_token});
        return true;

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

// Logout
export const logout = () => {
    chrome.storage.sync.clear();
}
