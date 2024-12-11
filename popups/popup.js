document.addEventListener("DOMContentLoaded", function() {
    
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
