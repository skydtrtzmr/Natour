const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.post('/forgetPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword); 

// 只有以上四个route不需要授权。

// Protect all routes after this middleware.
userRouter.use(authController.protect); // 保护以下所有路线。
// 因为中间件是按顺序执行的，所以写在上一句之后的routes都会受到保护。

userRouter.patch(
    '/updateMyPassword',
    authController.updatePassword
);

userRouter.get(
    '/Me',
    userController.getMe,
    userController.getUser
);

userRouter.patch(
    '/updateMe',
    userController.updateMe
);

userRouter.delete(
    '/deleteMe',
    userController.deleteMe
);

// 限制之后所有route都只能有admin角色执行。
userRouter.use(authController.restricTo('admin')); 

userRouter
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

userRouter
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);


module.exports = userRouter;