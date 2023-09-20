const express = require('express');
const Joi = require("joi");
// const bcrypt = require("bcrypt");
const _ = require("lodash");

const checkLoggedUser = require("../middleware/auth");
const User = require('../models/user');
const userService = require('../services/userService');


const router = express.Router();

// REGISTER 
router.post('/', async (req, res) => {

  // validate structre of data
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let user = await userService.createUser(req.body);

    const token = user.generateAuthToken();
    const userData = _.pick(user, ["username", "firstName", "lastName", "email", "isAdmin"]);

    res.header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(userData);

  } catch (error) {
    return res.status(400).send(error.message);
  }

});

// GET SOME USER HIS PROFILE
router.post('/get-profile', checkLoggedUser, async (req, res) => {

  const { username } = req.body;

  try {
    let user = await userService.getUserByUsername(username);;
    res.status(200).send({ user });
  } catch (error) {
    // res.status(500).json({ error: 'An error occurred while fetching user data' });
    return res.status(400).send();
  }

});

// GET CONNECTED USER PROFILE
router.get('/get-profile', checkLoggedUser, async (req, res) => {

  // GET USER DETAILS 
  let user = await userService.getUserByMail(req.user.mail);;
  if (user) {
    res.status(200).send({ user });
  } else {
    return res.status(400).send();
  }

});

// UPDATE USER HIS PROFILE DETAILS 
// TODO - change to put ".put('/:username' ..." and not by mail from body
router.post('/update-profile', checkLoggedUser, async (req, res) => {

  const { mail, firstName, lastName, phone, address, about } = req.body;

  // VALIDATION
  const { error } = userUpdateSchema.validate({ firstName, lastName, phone, address, about });
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // Find the user by ID
    const user = await User.findOne({ mail: mail });

    if (!user) res.status(400).send({ msg: "משהו השתבש - נסה שנית או צור קשר" });

    // Update user data
    user.set({ firstName, lastName, phone, address, about });
    await user.save().then(() => {
      res.status(200).send({ msg: "success" });
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "משהו השתבש - נסה שנית או צור קשר" });
  }

});

// SEARCH
router.post('/find', checkLoggedUser, async (req, res) => {

  const { ageScales, gender } = req.body;

  // validate search query
  const { error } = searchSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let foundUsers = await userService.searchUsers(req.body);
    res.status(200).send({ foundUsers });
  } catch (error) {
    return res.status(400).send({ error: 'An error occurred while fetching user data' });
  }

});

const searchSchema = Joi.object().keys({
  gender: Joi.number()
    .integer()
    .min(0)
    .max(1)
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'number.min':
            err.message = `ערך לא תקין למגדר`;
            break;
          case 'number.max':
            err.message = `ערך לא תקין למגדר`;
            break;
        }
      });
      return errors;
    }),
  ageScales: Joi.number()
    .integer()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'number.base':
            err.message = 'ערך גיל לא תקין';
            break;
        }
      });
      return errors;
    }),
});

const registerSchema = Joi.object().keys({
  mail: Joi.string()
    .min(5)
    .max(255)
    .required()
    .email()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "string.empty":
            err.message = "חובה להזין מייל";
            break;
          case "string.min":
            err.message = `חייב מייל עם לפחות ${err.local.limit} תוים`;
            break;
          case "string.max":
            err.message = `צריך מייל עם פחות מ- ${err.local.limit} תוים`;
            break;
          case "string.email":
            err.message = `חובה להזין מייל תקין`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  username: Joi.string()
    .min(5)
    .max(50)
    .required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "string.empty":
            err.message = "חובה להזין שם משתמש";
            break;
          case "string.min":
            err.message = `חייב שם משתמש עם לפחות ${err.local.limit} תוים`;
            break;
          case "string.max":
            err.message = `צריך שם משתמש עם פחות מ- ${err.local.limit} תוים`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  gender: Joi.number()
    .integer()
    .min(0)
    .max(1)
    .required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'any.required':
            err.message = 'חובה להזין מגדר';
            break;
          case 'number.min':
            err.message = `ערך לא תקין למגדר`;
            break;
          case 'number.max':
            err.message = `ערך לא תקין למגדר`;
            break;
        }
      });
      return errors;
    }),
  age: Joi.number()
    .integer()
    .required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'any.required':
            err.message = 'חובה להזין גיל';
            break;
        }
      });
      return errors;
    }),
  firstName: Joi.string()
    .min(2)
    .max(12)
    .required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "string.empty":
            err.message = "חובה להזין שם פרטי";
            break;
          case "string.min":
            err.message = `חייב שם פרטי עם לפחות ${err.local.limit} תוים`;
            break;
          case "string.max":
            err.message = `צריך שם פרטי עם פחות מ- ${err.local.limit} תוים`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  lastName: Joi.string()
    .min(2)
    .max(12)
    .required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "string.empty":
            err.message = "חובה להזין שם משפחה";
            break;
          case "string.min":
            err.message = `חייב שם משפחה עם לפחות ${err.local.limit} תוים`;
            break;
          case "string.max":
            err.message = `צריך שם משפחה עם פחות מ- ${err.local.limit} תוים`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  password: Joi.string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=(?:\D*\d){4,})(?=.*[^\da-zA-Z]).{8,}$/)
    .min(5)
    .max(255)
    .required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "string.empty":
            err.message = "חובה להזין סיסמא";
            break;
          case "string.min":
            err.message = `חייב סיסמא עם לפחות ${err.local.limit} תוים`;
            break;
          case "string.pattern.base":
            err.message = `סיסמא חייבת להכיל 4 ספרות אות אחת גדולה באנגלית ואחת קטנה ואחד מהסימנים (!@#$%^&*_-) ולהיות סה"כ באורך של 8 תווים`;
            break;
        }
      });
      return errors;
    }),
  address: Joi.string()
    .min(5)
    .max(45)
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "string.empty":
            err.message = "אי אפשר להזין כתובת ריקה";
            break;
          case "string.min":
            err.message = ` כתובת צריכה להיות עם לפחות ${err.local.limit} תוים`;
            break;
          case "string.max":
            err.message = `כתובת צריכה להיות עם פחות מ- ${err.local.limit} תוים`;
            break;
        }
      });
      return errors;
    }),
  about: Joi.string()
    .max(150)
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "string.max":
            err.message = `אודות לא יכול להיות עם יותר מ- ${err.local.limit} תוים`;
            break;
        }
      });
      return errors;
    }),
  isAdmin: Joi.boolean(),
  phone: Joi.string().allow('').trim().regex(/^[0-9]+$/).min(9).max(10)
    .error(errors => {
      errors.forEach(err => { err.message = `יש להזין מספר טלפון תקין`; });
      return errors;
    })
});

// TODO - write correctly the update users here
const userUpdateSchema = Joi.object().keys({
  phone: Joi.string().allow('').trim().regex(/^[0-9]+$/).min(9).max(10)
    .error(errors => {
      errors.forEach(err => { err.message = `יש להזין מספר טלפון תקין`; });
      return errors;
    }),
  firstName: Joi.string()
    .min(2)
    .max(12)
    .required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "string.empty":
            err.message = "חובה להזין שם פרטי";
            break;
          case "string.min":
            err.message = `חייב שם פרטי עם לפחות ${err.local.limit} תוים`;
            break;
          case "string.max":
            err.message = `צריך שם פרטי עם פחות מ- ${err.local.limit} תוים`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  lastName: Joi.string()
    .min(2)
    .max(12)
    .required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "string.empty":
            err.message = "חובה להזין שם משפחה";
            break;
          case "string.min":
            err.message = `חייב שם משפחה עם לפחות ${err.local.limit} תוים`;
            break;
          case "string.max":
            err.message = `צריך שם משפחה עם פחות מ- ${err.local.limit} תוים`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  address: Joi.string()
    .min(5)
    .max(45)
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "string.empty":
            err.message = "אי אפשר להזין כתובת ריקה";
            break;
          case "string.min":
            err.message = ` כתובת צריכה להיות עם לפחות ${err.local.limit} תוים`;
            break;
          case "string.max":
            err.message = `כתובת צריכה להיות עם פחות מ- ${err.local.limit} תוים`;
            break;
        }
      });
      return errors;
    }),
  about: Joi.string()
    .max(150)
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case "string.max":
            err.message = `אודות לא יכול להיות עם יותר מ- ${err.local.limit} תוים`;
            break;
        }
      });
      return errors;
    }),
});

module.exports = router;