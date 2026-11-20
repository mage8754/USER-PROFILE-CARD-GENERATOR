const { randomUUID } = require('crypto');
const { validationResult } = require('express-validator');

function createProfile(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please check the highlighted profile details.',
        errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg }))
      });
    }

    const skills = [...new Set(req.body.skills.map((skill) => skill.trim()).filter(Boolean))];
    if (skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Add at least one valid skill.',
        errors: [{ field: 'skills', message: 'Add at least one valid skill.' }]
      });
    }

    const socialLinks = {};
    for (const platform of ['linkedin', 'github']) {
      const link = req.body.socialLinks && req.body.socialLinks[platform];
      if (typeof link === 'string' && link.trim()) {
        socialLinks[platform] = link.trim();
      }
    }

    const profile = {
      id: randomUUID(),
      name: req.body.name,
      title: req.body.title,
      bio: req.body.bio,
      imageUrl: req.body.imageUrl || '',
      email: req.body.email,
      skills,
      location: req.body.location,
      socialLinks
    };

    return res.status(201).json({
      success: true,
      message: 'Profile generated successfully.',
      profile
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createProfile };
