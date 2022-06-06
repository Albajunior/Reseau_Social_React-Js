const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const auth = require('../middlewares/auth');
const testEmail = require('../middlewares/testEmailPattern');
const testPassword = require('../middlewares/testPasswordStrength');
const upload = require('../middlewares/upload');

router.post('/auth/signup', testEmail, testPassword, userCtrl.register);
router.post('/auth/login', userCtrl.login);
router.get('/secure/users', auth, userCtrl.getAllUsers);
router.get('/secure/users/:id', auth, userCtrl.getOneUser);
router.put('/secure/users/:id/changePassword', auth, testPassword, userCtrl.editUserPassword);
router.put('/secure/users/:id/changeEmail', auth, testEmail, userCtrl.editUserEmail);
router.delete('/secure/users/:id', auth, userCtrl.deleteUser);
router.get('/profiles/:id', auth, userCtrl.getOneProfile);
router.get('/profiles/', auth, userCtrl.getAllProfiles);
router.put('/profiles/:id', auth, upload, userCtrl.editProfile);
router.post('/profiles/search', auth, userCtrl.searchProfiles);
router.post('/profiles/textsearch', auth, userCtrl.textSearchProfile);

module.exports = router;