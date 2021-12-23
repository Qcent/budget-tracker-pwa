const router = require("express").Router();
const { User, Transaction } = require('../models');

/* USER ROUTES */

const {
    getUserById,
    getAllUser,
    createUser,
    deleteUser,
    getUsersTransactions
} = require('./user-routes');

// /api/users?user=<userId>
router.route('/api/users').get(getAllUser).post(createUser).delete(deleteUser);
router.route('/api/user').get(getUserById);
router.route('/api/user/transactions').get(getUsersTransactions);

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

module.exports = router;