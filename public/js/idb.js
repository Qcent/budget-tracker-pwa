// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'budget_tracker_app' and set it to version 1
const request = indexedDB.open('budget_tracker_app', 1);
// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_transaction`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_transaction', { autoIncrement: true });
    // create an object store (table) called `new_removal`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_removal', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;

    // check if app is online, if yes run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record, type = 'new_transaction') {
    //console.log(record);
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction([type], 'readwrite');

    // access the object store for `new_transaction`
    const transactionObjectStore = transaction.objectStore(type);

    // add record to your store with add method
    transactionObjectStore.add(record);

    console.log('Transaction stored in IndexDB');
}

function uploadTransaction(type = 'new_transaction') {
    // open a transaction on your db
    const transaction = db.transaction([type], 'readwrite');

    // access your object store
    const transactionObjectStore = transaction.objectStore(type);

    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            console.log(`Connection restored: ${getAll.result.length} ${type}(s) to submit.`);

            let apiCall = {
                route: '/api/transaction',
                method: 'POST',
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }
            switch (type) {
                case 'new_removal':
                    apiCall.method = 'DELETE'
                    break;

                default:
                    break;
            }


            fetch(apiCall.route, {
                    method: apiCall.method,
                    body: JSON.stringify(getAll.result),
                    headers: apiCall.headers
                })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        console.log(serverResponse);
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction([type], 'readwrite');
                    // access the new_transaction object store
                    const transactionObjectStore = transaction.objectStore(type);
                    // clear all items in your store
                    transactionObjectStore.clear();

                    console.log(`All saved ${type}s have been submitted!`);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', () => {
    document.querySelector(".form .error").innerHTML = '';
    uploadTransaction();
    uploadTransaction('new_removal');
    queryServer();
});