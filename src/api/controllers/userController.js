const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const async = require('async');
const crypto = require('crypto');
const _ = require('lodash');
const path = require('path');

const tokenList = {};

const User = mongoose.model('Users');

const commonFunction = require('../helpers/commonFunc');
const mailService = require('../services/mailService');
const config = require('../helpers/config');

const userController = (function() {
  function index(res, res) {
    return res.sendFile(path.resolve('./public/home.html'));
  }

  function renderForgotPasswordTemplate(res, res) {
    return res.sendFile(path.resolve('./public/forgot-password.html'));
  }

  function renderResetPasswordTemplate(res, res) {
    return res.sendFile(path.resolve('./public/reset-password.html'));
  }

  async function register(req, res) {
    try {
      const newUser = new User(req.body);

      newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
      const user = await newUser.save();
      user.hash_password = undefined;

      const data = {
        template: 'register-success-email',
        to: user.email,
        subject: 'Register Success',
        context: {
          name: user.fullName
        }
      };
      mailService.sendMail(data);
      return res.json(
        commonFunction.generateSuccessObject(user, 'Create User Success!')
      );
    } catch (error) {
      console.log(error);
      res.status(500).json(commonFunction.generateErrorObject(1000));
    }
  }

  async function signIn(req, res) {
    const { email } = req.body;
    try {
      const result = await User.findOne({ email }).exec();

      if (!result || !result.comparePassword(req.body.password)) {
        return res.status(401).json(commonFunction.generateErrorObject(1308));
      }

      const user = {
        email: result.email,
        fullName: result.fullName,
        _id: result._id
      };

      const token = jwt.sign(user, process.env.SECRET_KEY, {
        expiresIn: config.tokenLife
      });
      const refreshToken = jwt.sign(user, process.env.REFRESH_SECRET_KEY, {
        expiresIn: config.refreshTokenLife
      });
      const response = commonFunction.generateSuccessObject(
        {
          token,
          refreshToken
        },
        'Login Success!'
      );

      tokenList[refreshToken] = response;

      return res.status(200).json(response);
    } catch (err) {
      res.status(500).json(commonFunction.generateErrorObject(1000));
    }
  }

  function loginRequired(req, res, next) {
    if (req.user) {
      next();
    } else {
      return res.status(401).json(commonFunction.generateErrorObject(1101));
    }
  }

  function forgotPassword(req, res) {
    async.waterfall(
      [
        function(done) {
          User.findOne({
            email: req.body.email
          }).exec(function(err, user) {
            if (user) {
              done(err, user);
            } else {
              done('User not found.');
            }
          });
        },
        function(user, done) {
          // create the random token
          crypto.randomBytes(20, function(err, buffer) {
            var token = buffer.toString('hex');
            done(err, user, token);
          });
        },
        function(user, token, done) {
          User.findByIdAndUpdate(
            { _id: user._id },
            {
              reset_password_token: token,
              reset_password_expires: Date.now() + 86400000
            },
            { upsert: true, new: true }
          ).exec(function(err, new_user) {
            done(err, token, new_user);
          });
        },
        function(token, user, done) {
          var data = {
            to: user.email,
            from: email,
            template: 'forgot-password-email',
            subject: 'Password help has arrived!',
            context: {
              url: 'http://localhost:3000/auth/reset_password?token=' + token,
              name: user.fullName.split(' ')[0]
            }
          };
          mailService.sendMail(data, function(err) {
            if (!err) {
              return res.json({
                message: 'Kindly check your email for further instructions'
              });
            } else {
              return done(err);
            }
          });
        }
      ],
      function(err) {
        return res.status(422).json({ message: err });
      }
    );
  }

  function resetPassword(req, res, next) {
    User.findOne({
      reset_password_token: req.body.token,
      reset_password_expires: {
        $gt: Date.now()
      }
    }).exec(function(err, user) {
      if (!err && user) {
        if (req.body.newPassword === req.body.verifyPassword) {
          user.hash_password = bcrypt.hashSync(req.body.newPassword, 10);
          user.reset_password_token = undefined;
          user.reset_password_expires = undefined;
          user.save(function(err) {
            if (err) {
              return res.status(422).send({
                message: err
              });
            } else {
              const data = {
                to: user.email,
                from: email,
                template: 'reset-password-email',
                subject: 'Password Reset Confirmation',
                context: {
                  name: user.fullName.split(' ')[0]
                }
              };
              mailService.sendMail(data, function(err) {
                if (!err) {
                  return res.json({ message: 'Password reset' });
                } else {
                  return done(err);
                }
              });
            }
          });
        } else {
          return res.status(422).send({
            message: 'Passwords do not match'
          });
        }
      } else {
        return res.status(400).send({
          message: 'Password reset token is invalid or has expired.'
        });
      }
    });
  }

  async function getAll(req, res) {
    try {
      const userList = await User.find({});

      return res
        .status(200)
        .json(commonFunction.generateSuccessObject(userList, 'Login Success!'));
    } catch (error) {
      console.log(error);
      res.status(500).json(commonFunction.generateErrorObject(1000));
    }
  }

  async function extendToken(req, res) {
    try {
      const postData = req.body;
      console.log(tokenList);
      if (postData.refreshToken && postData.refreshToken in tokenList) {
        const user = {
          email: postData.email,
          fullName: postData.fullName
        };
        const token = jwt.sign(user, process.env.SECRET_KEY, {
          expiresIn: config.tokenLife
        });
        const response = {
          token: token
        };
        // update the token in the list
        tokenList[postData.refreshToken].token = token;
        res.status(200).json(response);
      } else {
        res.status(404).send('Invalid request');
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(commonFunction.generateErrorObject(1000));
    }
  }

  return {
    index,
    renderForgotPasswordTemplate,
    renderResetPasswordTemplate,
    register,
    signIn,
    loginRequired,
    forgotPassword,
    resetPassword,
    getAll,
    extendToken
  };
})();

module.exports = userController;
