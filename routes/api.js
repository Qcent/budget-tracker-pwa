const router = require("express").Router();
const { User, Transaction } = require('../models');

/* USER ROUTES */

const {
    getUserById,
    getAllUser,
    createUser,
    deleteUser,
    getUsersTransactions,
    deleteUsersTransactions
} = require('./user-routes');

// /api/users
router.route('/api/users').get(getAllUser).post(createUser);
router.route('/api/user').get(getUserById).delete(deleteUser);
router.route('/api/user/transactions').get(getUsersTransactions).delete(deleteUsersTransactions);

/******************** */
/* TRANSACTION ROUTES */
/******************** */
router.post("/api/transaction", ({ body }, res) => {
    Transaction.create(body)
        .then(({ _id }) => {
            return User.findOneAndUpdate({ _id: body.userId }, { $push: { transactions: _id } }, { new: true, runValidators: true });
        })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No User found with this id!' });
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => res.json(err));
});

router.post("/api/transaction/bulk", ({ body }, res) => {
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

router.delete("/api/transaction", (req, res) => {
    Transaction.findOneAndDelete({ _id: req.body.id })
        .then(deletedTransaction => {
            if (!deletedTransaction) {
                return res.status(404).json({ message: 'No Transaction with this id!' });
            }
            if (req.body.id) {
                return User.findOneAndUpdate({ _id: req.body.userId }, { $pull: { transactions: req.body.id } }, { new: true, runValidators: true });
            }
        })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No User found with this id!' });
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => res.json(err));
});


module.exports = router;