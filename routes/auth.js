const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');

const User = require('../models/user');

// LOGIN
router.post('/', async (req, res) => {
  console.log(req.body);
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ mail: req.body.email });
  if (!user) return res.status(400).send('מייל או סיסמא שגוי');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('מייל או סיסמא שגוי');

  const token = user.generateAuthToken();
  res.send(token);
});

const loginSchema = Joi.object({
  email: Joi.string().required().email().error(errors => {
    errors.forEach(err => {
      switch (err.code) {
        case "string.empty":
          err.message = "חובה להזין מייל";
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
  password: Joi.string().required().error(errors => {
    errors.forEach(err => {
      switch (err.code) {
        case "string.empty":
          err.message = "חובה להזין סיסמא";
          break;
      }
    });
    return errors;
  })
});

module.exports = router;
