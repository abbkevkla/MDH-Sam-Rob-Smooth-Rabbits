function startConnect() {
    clientID = document.getElementById("ID").value;

    // Fetch the hostname/IP address and port number from the form
    host = document.getElementById("host").value;
    port = document.getElementById("port").value;

    // Print output for the user in the messages div
    document.getElementById("messages").innerHTML += '<span>Connecting to: ' + host + ' on port: ' + port + '</span><br/>';
    document.getElementById("messages").innerHTML += '<span>Using the following client value: ' + clientID + '</span><br/>';
  // Initialize new Paho client connection
    client = new Paho.MQTT.Client(host, Number(port), clientID);
    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({userName : "kevin.klarin@abbindustrigymnasium.se",password : "1337",
        onSuccess: onConnect,
        onFailure: onFail,
                   });
}
function onFail() {
    document.getElementById("messages").innerHTML += '<span>ERROR: Connection to: ' + host + ' on port: ' + port + ' failed.</span><br/>'

}  
let topic="kevin.klarin@abbindustrigymnasium.se/";
// Called when the client connects
function onConnect() {
    // Fetch the MQTT topic from the form
    newtopic = topic + document.getElementById("topic").value;
    console.log(newtopic);
    // Print output for the user in the messages div
    document.getElementById("messages").innerHTML += '<span>Subscribing to: ' + newtopic + '</span><br/>';
    document.getElementById("status").innerHTML = "connected";

    // Subscribe to the requested topic
    client.subscribe(newtopic);
    message= new Paho.MQTT.Message("Connected from webpage");
    message.destinationName=newtopic;
    client.send(message);
}
function onSend() {
    // Fetch the MQTT topic from the form
    // Print output for the user in the messages div'
    //let message = "Dont press that button";
    let message= document.getElementById("newMessage").value;
    //console.log(message);
      message= new Paho.MQTT.Message(message);
      message.destinationName=newtopic;
      client.send(message);
}
// Called when the client loses its connection
function onConnectionLost(responseObject) {
    document.getElementById("messages").innerHTML += '<span>ERROR: Connection lost</span><br/>';
    if (responseObject.errorCode !== 0) {
        document.getElementById("messages").innerHTML += '<span>ERROR: ' + + responseObject.errorMessage + '</span><br/>';
    }
}

// Called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived: " + message.payloadString);
    document.getElementById("messages").innerHTML += '<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>';
    document.getElementById("latest_msg").value = message.payloadString;
}

// Called when the disconnection button is pressed
function startDisconnect() {
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
}

