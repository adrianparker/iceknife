const endpoint = "https://uh8jpafh76.execute-api.ap-southeast-2.amazonaws.com/entries";
var account, firstName, lastName, currentEntry;

// validate the account, first and last name; if valid, load entry from API if any
function loadForUser() {
    account = document.getElementById("account").value;
    firstName = document.getElementById("firstName").value;
    lastName = document.getElementById("lastName").value;
    if (!account || account < 1000 || account > 999999) {
        setError("Please specify Account between 4 and 6 digits", "authUIInfo");
        return;
    }
    if (!firstName || firstName.length < 1 || firstName.length > 100) {
        setError("Please specify First Name between 1 & 100 characters", "authUIInfo");
        return;
    }
    if (!lastName || lastName.length < 1 || lastName.length > 100) {
        setError("Please specify Last Name between 1 & 100 characters", "authUIInfo");
        return;
    }
    getEntryForUser();
}

// Queries API with user supplied account & name. Show entryUI if no entry returned, otherwise shows viewEntryUI
function getEntryForUser(){
    var queryParams = "?accountNumber=" + encodeURIComponent(account)+"&lastName=" + encodeURIComponent(lastName);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", endpoint + queryParams, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                currentEntry = xhr.responseText;
                if (currentEntry && currentEntry.length>0){
                    createEntryTableFromJSON(currentEntry);
                    toggleToViewState("viewEntryUI");
                } else {
                    toggleToViewState("entryUI");
                }
            } else {
                setError("Error retrieving entry. API response: "+ xhr.responseText, "authUIInfo");
            }
        }
    };
    xhr.send();
}

// generates table to show user their entry
function createEntryTableFromJSON(jsonString) {
    const jsonData = JSON.parse(jsonString);
    const tableContainer = document.getElementById("bob");
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    const headerCell1 = document.createElement("th");
    const headerCell2 = document.createElement("th");
    const rows = [];
    headerCell1.textContent = "Horse";
    headerCell2.textContent = "Will Finish";
    headerRow.appendChild(headerCell1);
    headerRow.appendChild(headerCell2);
    table.appendChild(headerRow);
    // Loop through JSON attributes and add table rows
    for (const key in jsonData) {
        if (key.startsWith("selection")) {
            const horseNumber = key.replace("selection", "");
            const row = document.createElement("tr");
            const cell1 = document.createElement("td");
            const cell2 = document.createElement("td");
            cell1.textContent = jsonData[key];
            cell2.textContent = key.substring(9);
            row.appendChild(cell1);
            row.appendChild(cell2);
            rows.push(row);
        }
    }
    // Sort and append the rows to the table; then add the table to view
    rows.sort((a, b) => {
        const horseNumberA = parseInt(a.firstChild.textContent.split(" ")[1]);
        const horseNumberB = parseInt(b.firstChild.textContent.split(" ")[1]);
        return horseNumberA - horseNumberB;
    });
    rows.forEach(row => {
        table.appendChild(row);
    });
    tableContainer.appendChild(table);

    document.getElementById("viewEntryUIHeadline").innerText += (firstName+"!");
}

// validates finishing order selections and if valid, places entry for the user
function submitEntryForm() {
    // validate selections
    var runners = [];
    var selectedPositions = [];
    var duplicateSelections = [];    
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
        setError("Duplicate selections found: " + duplicateSelections.join(", "), "entryUIInfo");
        return;
    }
    // POST entry
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
                getEntryForUser();
            } else {
                setError(xhr.responseText, "entryUIInfo");
            }
        }
    };
    xhr.send(JSON.stringify(payload));
}

// change to given view
function toggleToViewState(viewName) {
    // turn everything off
    toggleOffView("authUI");
    toggleOffView("entryUI");
    toggleOffView("viewEntryUI");
    // turn the view we want on
    document.getElementById(viewName).style.visibility = "visible";
    document.getElementById(viewName).style.display = "inline";
}

// hides given view
function toggleOffView(viewId){
    document.getElementById(viewId+"Info").innerText="";
    document.getElementById(viewId).style.display = "none";
    document.getElementById(viewId).style.visibility = "hidden";
}

// shows user error information
function setError(errorText, elementId) {
    setText(elementId, errorText, "red");
}

// shows user normal information
function setMessage(messageText, elementId) {
    setText(elementId, messageText, "black");
}

// show user information
function setText(elementId, message, colour) {
    console.log(message);
    var element = document.getElementById(elementId);
    element.innerText = message;
    element.style.color = colour;
}
