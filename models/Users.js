const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Hash du mot de passe avant sauvegarde.
 * Le hash n'est recalculé que lorsque le mot de passe est modifié.
 */
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    const salt = await bcrypt.genSalt(12);

    this.password = await bcrypt.hash(
      this.password,
      salt
    );

    next();
  } catch (error) {
    next(error);
  }
});

/*
 * Vérification du mot de passe lors de la connexion.
 */
userSchema.methods.matchPassword = async function (
  enteredPassword
) {
  if (!enteredPassword || !this.password) {
    return false;
  }

  return bcrypt.compare(
    enteredPassword,
    this.password
  );
};

module.exports = mongoose.model('User', userSchema);
