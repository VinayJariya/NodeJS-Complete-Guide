const crypto = require('crypto');

const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendGridTransport = require('nodemailer-sendgrid-transport');
const {
  validationResult
} = require('express-validator/check')

const User = require('../models/user')

const transporter = nodemailer.createTransport(sendGridTransport({
  auth: {
    api_key: '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',
  }
}))

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: []
  });
};

exports.getSignUp = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'SignUp',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
}

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422)
      .render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password,
        },
        validationErrors: errors.array()
      })
  }
  User.findOne({
    email: email
  }).then(user => {
    if (!user) {
      return res.status(422)
        .render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Email does not exists !!!',
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [{
            param: 'email'
          }]
        })
    }
    bcrypt.compare(password, user.password)
      .then(doMatch => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            console.log(err)
            res.redirect('/')
          })
        }
        return res.status(422)
          .render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Wrong password',
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [{
              param: 'password'
            }]
          })
      }).catch(err => {
        console.log(err)
      })
  }).catch(err => {
    console.log(err)
  })
}

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422)
      .render('auth/signup', {
        path: '/signup',
        pageTitle: 'SignUp',
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password,
          confirmPassword: req.body.confirmPassword
        },
        validationErrors: errors.array()
      });
  }

  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {
          items: []
        }
      });
      return user.save()
    }).then(result => {
      res.redirect('/login')
      transporter.sendMail({
          to: email,
          from: 'shop@node-complete.com',
          subject: 'SignUp Succeeded',
          html: '<h1>You successfully signed up</h1>'
        })
        .catch(err => {
          console.log(err);
        })
    })

}

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  })
}

exports.getReset = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect('/reset')
    }
    const token = buffer.toString('hex');
    User.findOne({
        email: email
      })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account associated with this email')
          return res.redirect('/reset')
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save()
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: email,
          from: 'shop@node-complete.com',
          subject: 'Password Reset',
          html: `
          <p>You requested a Password Reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>`
        })
      })
      .catch(err => {
        console.log(err)
      })
  })
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  console.log(token)
  User.findOne({
      resetToken: token,
      resetTokenExpiration: {
        $gt: Date.now()
      }
    }).then(user => {
      if (!user) {
        req.flash('error', 'Inavlid token or token expired')
        return res.redirect('/login')
      }
      let message = req.flash('error')
      if (message.length > 0) {
        message = message[0]
      } else {
        message = null
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        userId: user._id.toString(),
        errorMessage: message,
        passwordToken: token
      });
    })
    .catch(err => {
      console.log(err);
    })
};


exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken

  User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: {
        $gt: Date.now()
      },
      _id: userId
    })
    .then(user => {
      resetUser = user
      return bcrypt.hash(newPassword, 12)
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword
      resetUser.resetToken = undefined
      resetUser.resetTokenExpiration = undefined
      return resetUser.save()
    })
    .then(result => {
      res.redirect('/login')
    })
    .catch(err => {
      console.log(err)
    })
}