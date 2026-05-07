const feedback_url = "https://saiter.ca/api/feedback";
const feedback_key = "ejokcinciiekipmfledhdijjnjbelcmg";
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SEND_FEEDBACK') {
        fetch(feedback_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': feedback_key
            },
            body: JSON.stringify(request.payload)
        })
        .then(async res => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            return res.json();
        })
        .then(data => sendResponse({ success: true, data }))
        .catch(err => sendResponse({ success: false, error: err.message }));

        return true; // Indicates that we will send a response asynchronously
    }
});