import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { IUser } from '../types';

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 255,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    // store starred messages with timestamp for ordering by when they were starred
    starMessages: [
      {
        message: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Message',
        },
      },
    ],
  },
  {
    timestamps: true, methods: {
      comparePassword: async function (this: IUser, password: string): Promise<boolean> {
        return bcryptjs.compare(password, this.password);
      },
      toJSON: function () {
        const user = this.toObject();
        delete (user as Partial<IUser>).password;
        return user;

      },
    },
  },
);

// Hash password before saving
userSchema.pre('save', async function (this: mongoose.Document & IUser, next: (err?: Error) => void) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcryptjs.genSalt(15);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});


export const User = mongoose.model<IUser>('User', userSchema);
