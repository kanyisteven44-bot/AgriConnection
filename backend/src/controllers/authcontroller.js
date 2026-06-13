const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../services/emailservice");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    // Generate verification code BEFORE creation
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      password: hashed,
      verificationCode: code
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your AgriConnection Account",
      html: `<h1>Welcome! Your verification code is ${code}</h1>`
    });

    res.json({ message: "User registered. Please check your email for the code." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(404).json({ message: "Not found" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email first" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SEND CODE
exports.sendVerification = async (req, res) => {
  const { email } = req.body;

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.findOneAndUpdate(
    { email },
    { verificationCode: code },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: "Email not found" });
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "AgriConnection Verification",
    html: `<h1>Your code is ${code}</h1>`
  });

  res.json({ message: "Code sent" });
};

// VERIFY CODE
exports.verifyAccount = async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.verificationCode !== code)
    return res.status(400).json({ message: "Invalid code" });

  user.isVerified = true;
  user.verificationCode = null;

  await user.save();

  res.json({ message: "Account verified" });
};
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.findOneAndUpdate(
    { email },
    { resetPasswordCode: code }
  );

  if (!user) return res.status(404).json({ message: "User not found" });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset",
    html: `<h1>Your reset code: ${code}</h1>`
  });

  res.json({ message: "Reset code sent" });
};

exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.resetPasswordCode !== code)
    return res.status(400).json({ message: "Invalid code" });

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  user.resetPasswordCode = null;

  await user.save();

  res.json({ message: "Password updated" });
};