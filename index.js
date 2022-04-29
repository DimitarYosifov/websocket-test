let ws;

//if user closes this prompt, page reloads - stupid but who cares,
//we need username :)
let userName = prompt("Please enter your name");
if (!userName) {
    location.reload();
} else {
    ws = new WebSocket('ws://localhost:8080/', 'echo-protocol', {});
    console.log(ws);
    ws.onopen = (e) => {
        ws.send(JSON.stringify({ user: userName }));
    };
}

ws.onerror = (err) => {
    console.log(err)
};

ws.onmessage = async (message) => {
    await message.data.text().then((msg) => {
        if (typeof JSON.parse(msg) === "object") {
            //update users... - TODO - now we update all users, not adding the new one.  
            document.getElementById("users").innerHTML = '';
            const users = Object.keys(JSON.parse(msg));
            users.forEach(user => addNewUser(user));
        } else {
            let wholeMessage = JSON.parse(msg).split(": ");
            let user = wholeMessage[0];
            let _message = wholeMessage[1];
            addNewMessage(user, _message);
        }
    })
};

let sendMessage = () => {
    let message = document.getElementById("new-message").value;
    if (message.trim() !== "") {
        let message = userName + ": " + document.getElementById("new-message").value;
        ws.send(JSON.stringify(message));
        document.getElementById("new-message").value = "";
    }
    setTimeout(() => {
        document.getElementById("new-message").setSelectionRange(0, 0);
        document.getElementById("new-message").focus();
    }, 1);
}

let addNewMessage = (user, message) => {
    let container = document.getElementById("messages-container");
    let messageRow = document.createElement("div");
    messageRow.classList.add("message-row");
    container.appendChild(messageRow);

    let sender = document.createElement("span");
    sender.classList.add("sender");
    messageRow.appendChild(sender);
    sender.innerHTML = user + ": ";

    let text = document.createElement("span");
    text.classList.add("message");
    messageRow.appendChild(text);
    text.innerHTML = message;
}

let addNewUser = (newUser) => {
    let container = document.getElementById("users");
    let name = document.createElement("li");
    name.classList.add("user");
    container.appendChild(name);
    name.innerHTML = newUser;
}

document.addEventListener("keydown", (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
