/** @format */

import express from 'express';
import bcrypt from 'bcrypt';
import User from '../Models/UserModel.js';

import passport from 'passport';
import LocalStrategy from 'passport-local';

const router = express.Router();

router.post('/join', async (req, res) => {
  console.log(req.body);

  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const emailCheck = await User.findOne({ email: req.body.email });
    const phoneNumberCheck = await User.findOne({
      phoneNumber: req.body.phoneNumber,
    });

    if (emailCheck) {
      return res.status(200).json({ message: '중복되는 이메일이 있습니다' });
    }
    if (phoneNumberCheck) {
      return res
        .status(200)
        .json({ message: '중복되는 휴대폰 번호가 있습니다' });
    }
    const user = new User({
      email: req.body.email,
      password: hashPassword,
      displayName: req.body.displayName,
      phoneNumber: req.body.phoneNumber,
      roll: 'user',
      posts: 0,
    });
    await user.save();
    res.status(200).json({ message: '회원가입 성공' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '회원가입 실패' });
  }
});
router.post('/emailcheck', async (req, res) => {
  console.log(req.body);
});

router.use(passport.initialize());
router.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email', // 이 부분을 'email'로 설정
      passwordField: 'password',
    },
    async (입력한아이디, 입력한비번, cb) => {
      try {
        const user = await User.findOne({ email: 입력한아이디 });
        if (!user) {
          return cb(null, false, { message: '아이디 DB에 없음' });
        }
        const passwordMatch = await bcrypt.compare(입력한비번, user.password);
        if (!passwordMatch) {
          return cb(null, false, { message: '비번불일치' });
        }
        return cb(null, user);
      } catch (err) {
        console.log(err);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      posts: user.posts,
    });
  });
});

passport.deserializeUser(async (user, done) => {
  console.log('deserial : ', user);
  process.nextTick(() => {
    done(null, user);
  });
});

router.post('/login', async (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) return res.status(500).json(error);
    if (!user) return res.status(401).json(info.message);
    req.logIn(user, (err) => {
      if (err) return next(err);
      res
        .status(200)
        .json({ message: '로그인 성공', isLoggedIn: true, userInfo: user });
      console.log('good');
    });
  })(req, res, next);
});

router.get('/login/check', async (req, res) => {
  try {
    console.log('/login/check : ', req.user);
    if (!req.user) {
      res.status(201).json({ message: '세션 만료' });
    }
    res
      .status(200)
      .json({ message: '세션 있음', isLoggedIn: true, userInfo: req.user });
  } catch (err) {
    console.log(err);
  }
});

export default router;
