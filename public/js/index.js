let transactions = [];
let myChart;

const queryServer = () => fetch("/api/transaction")
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
        date: new Date().toISOString()
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

                // update transaction with id returned from DB
                transaction._id = data._id;
                console.log(transaction);
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

document.querySelector("#add-btn").onclick = function() {
    sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
    sendTransaction(false);
};

queryServer();