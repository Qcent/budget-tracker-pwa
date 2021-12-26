const { User, Transaction } = require('../models');

const UserFunctions = {
    // get all Users
    getAllUsers(req, res) {
        User.find({})
            .select('-__v')
            .select('-password')
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
            .select('-password')
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
    getUsersTransactions({ session }, res) {
        User.findOne({ _id: session.userId })
            .lean() // no virtuals
            .select('-_id') // no id
            .select('transactions') // just the transactions
            .populate({
                path: 'transactions',
                select: '-__v'
            })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id! : ' + session.userId });
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
                    .then(reponse => res.json({ reponse, reset: 'true' }))
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
    createUser({ body, session }, res) {
        console.log("=========== NEW USER SUBMITTED! =============");
        console.log(body);
        User.create(body)
            .then(dbUserData => {
                session.save(() => {
                    // declare session variables for instant login
                    session.userId = dbUserData._id;
                    session.username = dbUserData.username;
                    session.loggedIn = true;

                    res.json({ user: { _id: dbUserData._id, username: dbUserData.username }, message: 'You are now logged in!' });
                    console.log("=========== NEW USER CREATED! =============");
                });

            })
            .catch(err => {
                console.log("=========== FAILED! =============");
                console.log(err)
                res.status(400).json(err)
            });
    },

    // update User by id
    updateUser({ body, query }, res) {
        User.findOneAndUpdate({ _id: query.userId }, body, { new: true, runValidators: true })
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

                res.json({ deleted: 'true' });
            })
            .catch(err => res.status(400).json(err));
    },

    userLogin({ body, session }, res) {
        console.log("*************** LOGIN ATTEMPT ***************");
        console.log(body.email);
        if (session.loggedIn) {
            console.log("ALREADY LOGGED IN!")
            res.status(400).json({ message: 'ALREADY LOGGED IN!' });
            return;
        }

        User.findOne({
            email: body.email
        }).then(dbUserData => {
            if (!dbUserData) {
                res.status(400).json({ message: 'No user with that email address!' });
                console.log("=========== !FAILURE! =============");
                return;
            }

            // Verify user
            const validPassword = dbUserData.comparePassword(body.password, (err, match) => {
                if (!match) {
                    res.status(400).json({ message: 'Incorrect password!' });
                    console.log("=========== !FAILURE! =============");
                    return;
                }

                session.save(() => {
                    // declare session variables
                    session.userId = dbUserData._id;
                    session.username = dbUserData.username;
                    session.loggedIn = true;

                    res.json({ user: { _id: dbUserData._id, username: dbUserData.username }, message: 'You are now logged in!' });
                    console.log("=========== SUCCESS! =============");
                });
            });
        });
    },

    userLogout(req, res) {
        console.log("************** LOGGING OUT **************");
        if (req.session.loggedIn) {
            req.session.destroy(() => {
                res.status(204).end();
            });
        } else {
            res.status(404).json({ message: 'Not Logged In!' });
        }
    },

}


module.exports = UserFunctions;