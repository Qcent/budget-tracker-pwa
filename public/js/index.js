let transactions = [];
let myChart;

// Cookies
function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";

    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

// get the transactions
const queryServer = () => fetch("/api/user/transactions?userId=" + readCookie("userId"), {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        //body: JSON.stringify({ userId: "61c4ec8d5eb0ba3c8f7fdcac" }) // body data type must match "Content-Type" header
    })
    .then(response => response.json())
    .then(data => {
        // save db data on global variable
        transactions = data;
        // also save in localStorage for offline recall
        localStorage.transactions = JSON.stringify(transactions);

        populateTotal();
        populateTable();
        populateChart();
    })
    .catch(err => {
        console.log(err);
        console.log("(NETWORK ERROR?) trying localStorage ...");
        transactions = JSON.parse(localStorage.transactions);

        if (transactions.length) {
            console.log("Success!");
            populateTotal();
            populateTable();
            populateChart();
        } else { console.log("No Transactions Found!"); }
    });

//fill out the chart
function populateTotal() {
    // reduce transaction amounts to a single total value
    let total = transactions.reduce((total, t) => {
        return total + parseInt(t.value);
    }, 0);

    let totalEl = document.querySelector("#total");
    totalEl.textContent = total;
}

function populateTable() {
    let tbody = document.querySelector("#tbody");
    tbody.innerHTML = "";

    transactions.forEach(transaction => {
        // create and populate a table row
        let tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

        tbody.appendChild(tr);
    });
}

function populateChart() {
    // copy array and reverse it
    let reversed = transactions.slice().reverse();
    let sum = 0;

    // create date labels for chart
    let labels = reversed.map(t => {
        let date = new Date(t.date);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    });

    // create incremental values for chart
    let data = reversed.map(t => {
        sum += parseInt(t.value);
        return sum;
    });

    // remove old chart if it exists
    if (myChart) {
        myChart.destroy();
    }

    let ctx = document.getElementById("myChart").getContext("2d");

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: "Total Over Time",
                fill: true,
                backgroundColor: "#6666ff",
                data
            }]
        }
    });
}

// submit a transaction to the database
function sendTransaction(isAdding) {
    let nameEl = document.querySelector("#t-name");
    let amountEl = document.querySelector("#t-amount");
    let errorEl = document.querySelector(".form .error");

    // validate form
    if (nameEl.value === "" || amountEl.value === "") {
        errorEl.textContent = "Missing Information";
        return;
    } else {
        errorEl.textContent = "";
    }

    // create record
    let transaction = {
        name: nameEl.value,
        value: amountEl.value,
        date: new Date().toISOString(),
        userId: readCookie('userId')
    };

    // if subtracting funds, convert amount to negative number
    if (!isAdding) {
        transaction.value *= -1;
    }

    // add to beginning of current array of data
    transactions.unshift(transaction);
    // also save in localStorage for offline recall
    localStorage.transactions = JSON.stringify(transactions);

    // re-run logic to populate ui with new record
    populateChart();
    populateTable();
    populateTotal();

    // also send to server
    fetch("/api/transaction", {
            method: "POST",
            body: JSON.stringify(transaction),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.errors) {
                errorEl.textContent = "Missing Information";
            } else {
                // clear form
                nameEl.value = "";
                amountEl.value = "";
            }
        })
        .catch(err => {
            // alert user of connection error
            document.querySelector(".form .error").innerHTML =
                `<span class='tooltip'>Currently unable to sync with server❗
                <span class="tooltiptext">This transaction will not be visible on other devices, and some transactions may not be visible to you, until a connection is restored.
                </span></span>`;

            // fetch failed, so save in indexed db
            saveRecord(transaction);

            // clear form
            nameEl.value = "";
            amountEl.value = "";
        });
}

// set the button click listeners
document.querySelector("#add-btn").onclick = function() {
    sendTransaction(true);
};
document.querySelector("#sub-btn").onclick = function() {
    sendTransaction(false);
};

//displays the sign up modal
const showSignup = () => {
    $('#user-signup-email').val($('#user-login-email').val());
    $('#user-signup-password').val($('#user-login-password').val());

    $('#loginModal').modal('hide');
    $('#signupModal').modal('show');
}

// submits the user login
async function loginFormHandler(event) {
    event.stopImmediatePropagation();
    event.preventDefault();

    var form = document.querySelector('#user-login-form'); // give the form an ID

    let response = await fetch(form.action, {
        method: "POST",
        body: JSON.stringify({ email: form.email.value, password: form.password.value }),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
        }
    });
    if (response.ok) {

        const userInfo = await response.json()
            // console.log(userInfo.user.username)  
        createCookie('userId', userInfo.user._id);
        createCookie('username', userInfo.user.username);
        createCookie('loggedIn', 'true');
        // wait a small delay for the cookies to be set
        delayedReload(300);

    } else {
        const { message: errMsg } = await response.json();
        console.log("Login Error!");
        $('#login-error').text(errMsg);
        $('#login-error').show();
    }
}
// listener for the login submission
document.querySelector('#user-login-form').addEventListener('submit', loginFormHandler);

// submits the user signup
async function signupFormHandler(event) {
    event.stopImmediatePropagation();
    event.preventDefault();

    var form = document.querySelector('#user-signup-form'); // give the form an ID

    let response = await fetch(form.action, {
        method: "POST",
        body: JSON.stringify({ username: form.username.value, email: form.email.value, password: form.password.value }),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
        }
    });
    if (response.ok) {
        location.reload();
    } else {
        const { message: errMsg } = await response.json();
        console.log("Signup Error!");
        $('#signup-error').text(errMsg);
        $('#signup-error').show();
    }
}
// listener for the signup submission
document.querySelector('#user-signup-form').addEventListener('submit', signupFormHandler);

// adds a small delay before reloading the page so cookies can be set and proper info displayed
const delayedReload = (milsec = 100) => {
        // wait a small delay for the cookies to be set
        setTimeout(() => {
            location.reload(true);
        }, milsec);
    }
    // clears cookies on logout to prevent server/client sync delays
const logoutUser = () => {
    eraseCookie('loggedIn');
    eraseCookie('userId');
    eraseCookie('username');
    delayedReload();
}

// helper functions to focus first element in form on modal appearance
$('#loginModal').on('shown.bs.modal', function() {
    $('#user-login-email').focus();
});
$('#signupModal').on('shown.bs.modal', function() {
        $('#user-signup-name').focus();
    })
    // helper functions to hide error message on modal disapearance
$('#loginModal').on('hidden.bs.modal', function() {
    $('#login-error').hide();
});
$('#signupModal').on('hidden.bs.modal', function() {
    $('#signup-error').hide();
})

// get the transactions
queryServer();

// no template engine so use javascript and cookies to display dynamic info to user
if (readCookie('loggedIn') === 'true') {
    document.querySelector("#usernameNav").textContent = readCookie('username');
    $(document.querySelector('#loginNav')).hide();
} else {
    $(document.querySelector('#logoutNav')).hide();
    $(document.querySelector('#usernameNav')).hide();
}