const express = require('express');
const { body } = require('express-validator');
const { createProfile } = require('../controllers/profileController');

const router = express.Router();

const optionalHttpUrl = (field, label) =>
  body(field)
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage(`${label} must be a valid http or https URL.`);

router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Full name is required.')
      .isLength({ max: 80 })
      .withMessage('Full name must be 80 characters or fewer.'),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Professional title is required.')
      .isLength({ max: 100 })
      .withMessage('Professional title must be 100 characters or fewer.'),
    body('bio')
      .trim()
      .notEmpty()
      .withMessage('A short bio is required.')
      .isLength({ max: 500 })
      .withMessage('Bio must be 500 characters or fewer.'),
    optionalHttpUrl('imageUrl', 'Profile image'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Enter a valid email address.')
      .normalizeEmail(),
    body('skills')
      .isArray({ min: 1, max: 12 })
      .withMessage('Add between 1 and 12 skills.'),
    body('skills.*')
      .trim()
      .notEmpty()
      .withMessage('Skills cannot be empty.')
      .isLength({ max: 40 })
      .withMessage('Each skill must be 40 characters or fewer.'),
    body('location')
      .trim()
      .notEmpty()
      .withMessage('Location is required.')
      .isLength({ max: 100 })
      .withMessage('Location must be 100 characters or fewer.'),
    body('socialLinks')
      .optional()
      .isObject()
      .withMessage('Social links must be an object.'),
    optionalHttpUrl('socialLinks.linkedin', 'LinkedIn link'),
    optionalHttpUrl('socialLinks.github', 'GitHub link')
  ],
  createProfile
);

module.exports = router;
