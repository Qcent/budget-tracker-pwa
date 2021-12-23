const { User, Transaction } = require('../models');

const UserFunctions = {
    // get all Users
    getAllUser(req, res) {
        User.find({})
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbUserData => res.json(dbUserData))
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },

    // get one User by id
    getUserById({ body }, res) {
        User.findOne({ _id: body.userId })
            .populate({ path: 'transactions', select: '-__v' })
            .select('-__v')
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: `No User found with this id! : ${body.userId}` });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },

    // get one Users Transactions
    getUsersTransactions({ body }, res) {
        User.findOne({ _id: body.userId })
            .lean() // no virtuals
            .select('-_id') // no id
            .select('transactions') // just the transactions
            .populate({
                path: 'transactions',
                select: '-__v'
            })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id!' });
                    return;
                }
                // just the transactions array is returned in reverse order
                res.json(dbUserData.transactions.reverse());
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },

    // delete a Users Transactions
    deleteUsersTransactions({ body }, res) {
        User.findOne({ _id: body.userId })
            .lean() // no virtuals
            .select('-_id') // no id
            .select('transactions') // just the transactions
            .populate({
                path: 'transactions',
                select: '-__v'
            })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id!' });
                    return;
                }
                // just the transactions array is needed
                //res.json(dbUserData.transactions.reverse());
                dbUserData.transactions.forEach(item => {
                    Transaction.findOneAndDelete({ _id: item._id })
                        .then(deletedTransaction => {
                            if (!deletedTransaction) {
                                return res.status(404).json({ message: 'No Transaction with this id!' });
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(400).json(err);
                        });
                });

                User.findOneAndUpdate({ _id: body.userId }, { transactions: [] }, { new: true, runValidators: true })
                    .then(message => res.json(message))
                    .catch(err => {
                        console.log(err);
                        res.status(400).json(err);
                    });



            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },


    // createUser
    createUser({ body }, res) {
        User.create(body)
            .then(dbUserData => res.json(dbUserData))
            .catch(err => res.status(400).json(err));
    },

    // update User by id
    updateUser({ body }, res) {
        User.findOneAndUpdate({ _id: body.userId }, body, { new: true, runValidators: true })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id!' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.status(400).json(err));
    },

    // delete User
    deleteUser({ body }, res) {
        User.findOneAndDelete({ _id: body.userId })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id!' });
                    return;
                }
                console.log('***********DELETING USER*************');
                console.log(dbUserData);

                res.json(dbUserData);
            })
            .catch(err => res.status(400).json(err));
    },

}


module.exports = UserFunctions;