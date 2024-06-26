const asyncHandler = require("express-async-handler");
const UserService = require('../services/UserService');
const User = require('../models/UserModel');
const EmailHelper = require("../utils/emailHelper");
const generateToken = require("../utils/generateToken");
const errorMessage = require('../resources/lang/fr/errorMessage');
const successMessage = require('../resources/lang/fr/successMessage');

/**
 * @description Authentification user
 * @route POST /api/users/login
 * @access Public
 */
const login = asyncHandler(async(req, res) => {
    const userService = new UserService();
    const { email, password } = req.body;

    try {
        const authenticatedUser = await userService.authentificationUser(email, password);
        if(authenticatedUser.error) {
            res.status(authenticatedUser.status).json({ message: authenticatedUser.message });    
        } else {
            res.status(authenticatedUser.status).json({ message: authenticatedUser.message, data: authenticatedUser.data});
        }
        
    } catch (error) {
        res.status(500).json({ message: errorMessage.default });
    }
});

/**
 * @description Register user
 * @route POST /api/users/
 * @access Public
 */
const register = asyncHandler(async(req, res) => {
    const userService = new UserService();
    if (!req.body) {
        res.status(422).json({ message: errorMessage.validations });
        return;
    }
    const { firstname, lastname, email, password } = req.body;
    if (!firstname) {
        res.status(400).json({ message: errorMessage.user.firstname });
        return;
    } else if (!lastname) {
        res.status(400).json({ message: errorMessage.user.lastname });
        return;
    } else if (!email) {
        res.status(400).json({ message: errorMessage.user.email });
        return;
    } else if (!password) {
        res.status(400).json({ message: errorMessage.user.password });
        return;
    }
    

    try {

        const userExists = await User.findOne({ email })
        
        if (userExists) {
            res.status(409).json({ message: errorMessage.user.already_exist });
        }
        const isValidEmail = EmailHelper.isValidEmail(email);
        
        if(!isValidEmail) {
            return res.status(400).json({ message: errorMessage.user.invalid_email })
        }
        const createdUser = await userService.create({
            firstname, 
            lastname,
            email,
            password
        });
        
        if(createdUser) {
            res.status(201).json({
                message: successMessage.user.created,
                data: {
                    _id: createdUser._id,
                    firstname: createdUser.firstname,
                    lastname: createdUser.lastname,
                    email: createdUser.email,
                    isAdmin: createdUser.isAdmin,
                    token: generateToken(createdUser._id),
                    }
                })
        } else {
        res.status(403).json({ message: errorMessage.default});
        }
    } catch (error) {
        res.status(500).json({ message: errorMessage.default });
    }
})

/**
 * @description Get All users
 * @route GET /api/users/
 * @access Private/Admin
 */
const getUsers = asyncHandler(async(req, res) => {
    const userService = new UserService();
    try {
        const users = await userService.allUsers()
        if(users === 0) {
            res.status(400).json({ message: errorMessage.collection });
        }
        res.json({message: successMessage.user.collection_informations ,data: users});
    } catch (error) {
        res.status(500).json({ message: errorMessage.default });
    }
});

/**
 * @description Get User by Id
 * @route GET /api/users/:id
 * @access Private/Admin
 */
const getUserById = asyncHandler(async(req, res) => {
    try {
        const userService = new UserService();
        const user = await userService.getById(req.params.id);
        if(!user) {
            return res.status(403).json({ message: errorMessage.user.not_found });
        } else {
            res.status(200).json({
                message: successMessage.user.informations,
                data: {
                    _id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    }
                })
        } 
    } catch (error) {
        res.status(500).json({ message: errorMessage.default });
    }
})

/**
 * @description Update User by Id
 * @route PUT /api/users/:id
 * @access Private/Admin
 */
const updateUser = asyncHandler(async(req, res) => {
    const userService = new UserService();
    const updated = await userService.update(req.params.id, req.body);
    res.json({
        message: successMessage.user.updated, 
        data: updated
    });
});

/**
 * @description Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userService = new UserService();

    try {
        const userProfile = await userService.userProfile(userId);
        res.json(userProfile);
    } catch (error) {
        res.status(404).json({ message: errorMessage.default });
    }
});

/**
 * @description Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userData = req.body;
    const userService = new UserService();

    try {
        const updatedUserProfile = await userService.updateUserProfile(userId, userData);
        if(updatedUserProfile.error) {
            res.status(updatedUserProfile.status).json(updatedUserProfile.message);
        }
        res.status(updatedUserProfile.status).json({message: updatedUserProfile.message, data: updatedUserProfile.data });
    } catch (error) {
        res.status(400).json({ message: errorMessage.default });
    }
});

/**
 * @description Delete user by id
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
const deleteUser = asyncHandler(async(req, res) => {
    const userService = new UserService();
    const deleted = await userService.delete(req.params.id);
    if(!deleted) {
        res.status(403).json({ message: errorMessage.user.deleted });    
    }
    res.json({ message: successMessage.user.deleted, data: deleted });
})

module.exports = { login, register, getUsers ,getUserProfile, getUserById, updateUser, updateUserProfile, deleteUser }