document.addEventListener("DOMContentLoaded", function() {

    // Attach an eventListener to the login button
    const loginButton = document.getElementById("loginButton");
    loginButton.addEventListener('click', login);
    
    // Attach an eventListener to the button
    const getUrlButton = document.getElementById("getUrlButton");
    getUrlButton.addEventListener('click', function() {

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

    });
});


const login = async () => {
    const endpoint = "http://127.0.0.1:8000/cards/67519a936f2b63ddc7239bab?show_page=false";

    try {
        const response = await fetch(endpoint);
    
        if (response.ok) {
          // Fill the form
          const card = await response.json();
    
        //   document.getElementById("url").value = card["url"];
          document.getElementById("titleField").value = card["title"];
          document.getElementById("descriptionField").value = card["description"];
          document.getElementById("thumbnailField").value = card["thumbnail"];
        } else {
          // Handle error
          const errorData = await response.json();
          alert(`Error: ${errorData.detail.error}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      }
}
