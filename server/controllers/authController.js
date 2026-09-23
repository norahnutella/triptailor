import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    bio: user.bio,
    joinedDate: user.joinedDate,
    tripsCount: user.tripsCount,
    savedPlacesCount: user.savedPlacesCount,
    currency: user.currency,
    travelPace: user.travelPace,
    preferredCuisines: user.preferredCuisines
  };
}

function issueToken(user) {
  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function register(req, res) {
  try {
    const { name, email, password, avatar, travelPace } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({
      email: normalizedEmail
    });

    if (existing) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hash,
      avatar: avatar || '',
      travelPace: travelPace || 'Balanced',
      joinedDate: new Date().getFullYear().toString()
    });

    return res.status(201).json({
      token: issueToken(user),
      user: publicUser(user)
    });

  } catch (error) {
    console.error('register error', error);

    return res.status(500).json({
      message: 'Unable to create the account right now.'
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: 'Email and password are required.'
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    return res.json({
      token: issueToken(user),
      user: publicUser(user)
    });

  } catch (error) {
    console.error('login error', error);

    return res.status(500).json({
      message: 'Unable to sign in right now.'
    });
  }
}

export async function me(req, res) {
  return res.json({
    user: publicUser(req.user)
  });
}

export async function updateMe(req, res) {
  try {
    const allowed = [
      'name',
      'email',
      'phone',
      'avatar',
      'bio',
      'currency',
      'travelPace',
      'preferredCuisines'
    ];

    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.email) {
      updates.email = String(updates.email).trim().toLowerCase();
    }

    if (updates.name) {
      updates.name = String(updates.name).trim();
    }

    if (updates.email && updates.email !== req.user.email) {
      const duplicate = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user._id }
      });

      if (duplicate) {
        return res.status(409).json({
          message: 'That email is already in use.'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    return res.json({
      user: publicUser(user)
    });

  } catch (error) {
    console.error('update profile error', error);

    return res.status(400).json({
      message: 'Unable to update your profile.'
    });
  }
}


/*
|--------------------------------------------------------------------------
| CHANGE PASSWORD
|--------------------------------------------------------------------------
*/

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        message: 'User account not found.'
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Current password is incorrect.'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: 'New password must be different from your current password.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;

    // Invalidate any previous password-reset token.
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({
      message: 'Password changed successfully.'
    });

  } catch (error) {
    console.error('change password error', error);

    return res.status(500).json({
      message: 'Unable to change your password right now.'
    });
  }
}


/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
|--------------------------------------------------------------------------
|
| This creates a secure one-time reset token.
|
| The actual email delivery will be connected separately because an
| SMTP/email provider is required to send the reset link.
|
*/

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        message: 'Email is required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    }).select('+resetPasswordToken +resetPasswordExpires');

    /*
     * We return the same response whether the account exists or not.
     * This prevents revealing which email addresses have accounts.
     */
    if (!user) {
      return res.json({
        message: 'If an account exists for this email, password reset instructions will be sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedResetToken;

    // Token is valid for 15 minutes.
    user.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    /*
     * For now, the token is returned only in development.
     * This lets us test the complete reset flow before connecting
     * an email provider.
     */
    const response = {
      message: 'If an account exists for this email, password reset instructions will be sent.'
    };

    if (process.env.NODE_ENV !== 'production') {
      response.resetToken = resetToken;
    }

    return res.json(response);

  } catch (error) {
    console.error('forgot password error', error);

    return res.status(500).json({
      message: 'Unable to process the password reset request right now.'
    });
  }
}


/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: 'Reset token and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long.'
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    }).select(
      '+password +resetPasswordToken +resetPasswordExpires'
    );

    if (!user) {
      return res.status(400).json({
        message: 'The password reset link is invalid or has expired.'
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);

    // Make the reset token single-use.
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({
      message: 'Password has been reset successfully.'
    });

  } catch (error) {
    console.error('reset password error', error);

    return res.status(500).json({
      message: 'Unable to reset your password right now.'
    });
  }
}