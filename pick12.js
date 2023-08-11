const endpoint = "https://uh8jpafh76.execute-api.ap-southeast-2.amazonaws.com/entries";

// POSTs an entry for the user
function submitEntryForm() {

    setMessage("");
    setError("");

    var runners = [];
    var selectedPositions = [];
    var duplicateSelections = [];
    var firstName = document.getElementById("firstName").value;
    var lastName = document.getElementById("lastName").value;
    
    // validate account, first name, last name, selections
    var account = document.getElementById("account").value;
    if (!account || account < 1000 || account > 999999) {
        setError("Please specify Account between 4 and 6 digits");
        return;
    }
    if (!firstName || firstName.length < 1 || firstName.length > 100) {
        setError("Please specify First Name between 1 & 100 characters");
        return;
    }
    if (!lastName || lastName.length < 1 || lastName.length > 100) {
        setError("Please specify Last Name between 1 & 100 characters");
        return;
    }
    for (var i = 1; i <= 12; i++) {
        var selection = "Horse " + i;
        var position = parseInt(document.getElementById("horse" + i).value);
        if (selectedPositions.includes(position)) {
            duplicateSelections.push(selection);
        } else {
            selectedPositions.push(position);
        }
        runners.push({ "selection": selection, "position": position });
    }
    if (duplicateSelections.length > 0) {
        setError("Duplicate selections found: " + duplicateSelections.join(", "));
        return;
    }

    setMessage("Saving your entry...");
    var payload = {
        "accountNumber": parseInt(account),
        "firstName": firstName,
        "lastName": lastName,
        "runners": runners
    };
    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                toggleToViewState();
            } else {
                setError(xhr.responseText);
            }
        }
    };
    xhr.send(JSON.stringify(payload));
}

function toggleToViewState() {
    setMessage("Form submitted successfully!");
    document.getElementById("headline").innerText = "View Your Entry";
    document.getElementById("entryForm").style.display = "none";
    document.getElementById("viewForm").style.visibility = "visible";
    document.getElementById("viewForm").style.display = "inline";
}

// shows user error information
function setError(errorText) {
    setText("errorText", errorText);
}

// shows user normal information
function setMessage(message) {
    setText("message", message);
}

// set user informational text
function setText(elementId, message) {
    console.log(message);
    var element = document.getElementById(elementId);
    element.innerText = message;
}

// loads and displays prior entry, if any
function viewEntry() {
    setError("");
    setMessage("");

    var account = document.getElementById("accountV").value;
    var lastName = document.getElementById("lastNameV").value;

    // validate account, last name
    if (!account || account < 1000 || account > 999999) {
        setError("Please specify Account between 4 and 6 digits");
        return;
    }
    if (!lastName || lastName.length < 1 || lastName.length > 100) {
        setError("Please specify Last Name between 1 & 100 characters");
        return;
    }

    setMessage("Retrieving your entry...");
    var queryParams = "?accountNumber=" + encodeURIComponent(account)+"&lastName=" + encodeURIComponent(lastName);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", endpoint + queryParams, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                setMessage(JSON.stringify(JSON.parse(xhr.responseText)));
            } else {
                setError("Error retrieving entry. API response:", xhr.responseText);
            }
        }
    };
    xhr.send();
}
