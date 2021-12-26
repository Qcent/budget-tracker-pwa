const router = require("express").Router();
const { User, Transaction } = require('../models');
const { withAuth, sameUser } = require('../utils/auth');

/* USER ROUTES */

const {
    getUserById,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getUsersTransactions,
    deleteUsersTransactions,
    userLogin,
    userLogout
} = require('./user-routes');

// /api/users
router.route('/api/users').get(withAuth, getAllUsers).post(createUser);
router.route('/api/user').get(withAuth, getUserById).put(sameUser, updateUser).delete(sameUser, deleteUser);

router.route('/api/user/login').post(userLogin);
router.route('/api/user/logout').get(userLogout);

router.route('/api/user/transactions').get(sameUser, getUsersTransactions).delete(sameUser, deleteUsersTransactions);

/******************** */
/* TRANSACTION ROUTES */
/******************** */
router.post("/api/transaction", sameUser, ({ body, session }, res) => {
    console.log("########### NEW TRANSACTION(S) ############");
    console.log(body);
    Transaction.create(body)
        .then(transData => { //{ _id }
            let data = []
                // when submitted from indexDB transData is an array of objects 
                // so turn a single object into an array so this code will work in all cases
            if (!Array.isArray(transData)) transData = [transData];
            transData.forEach(transaction => {
                data.push(transaction._id)
            });

            console.log(`----------- ADDING ${transData.length} TRANSACTIONS--------------`);
            console.log(data);
            console.log("TO USER: " + session.userId);

            return User.findOneAndUpdate({ _id: session.userId }, { $push: { transactions: data } }, { new: true, runValidators: true });
        })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No User found with this id!' });
                return;
            }
            //console.log(dbUserData)
            //sendback the id of the last transaction
            res.json(dbUserData.transactions[dbUserData.transactions.length - 1]);
        })
        .catch(err => res.json(err));
});

router.post("/api/transaction/bulk", withAuth, sameUser, ({ body }, res) => {
    Transaction.insertMany(body)
        .then(dbTransaction => {
            res.json(dbTransaction);
        })
        .catch(err => {
            res.status(404).json(err);
        });
});

router.get("/api/transaction", (req, res) => {
    Transaction.find({}).sort({ date: -1 })
        .then(dbTransaction => {
            res.json(dbTransaction);
        })
        .catch(err => {
            res.status(404).json(err);
        });
});

router.delete("/api/transaction", sameUser, ({ body }, res) => {
    // when submitted from indexDB transData is an array of objects 
    // so turn a single object into an array so this code will work in all cases
    if (!Array.isArray(body)) body = [body];
    body.forEach(transaction => {
        console.log("########## DELETE TRANSACTION ##########");
        console.log(transaction)
        Transaction.findOneAndDelete({ _id: transaction.id })
            .then(deletedTransaction => {
                if (!deletedTransaction) {
                    return res.status(404).json({ message: 'No Transaction with this id! : ' + transaction.id });
                }
                console.log("########## SUCCESS ##########");
                if (transaction.userId) {
                    return User.findOneAndUpdate({ _id: transaction.userId }, { $pull: { transactions: transaction.id } }, { new: true, runValidators: true });
                }
            })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id!' });
                    return;
                }
                console.log("########## AND REMOVED FROM USER ##########");
            })
            .catch(err => res.json(err));
    });
    res.json({ ok: 'true' });
});


module.exports = router;