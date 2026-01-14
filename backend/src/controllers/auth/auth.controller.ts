import type { Response, Request } from "express";
import bcrypt from "bcryptjs";
import validator from "validator";
import { IResponse } from "../../interfaces/responseInterface.js";
import IUser from "../../interfaces/userModelInterface.js";
import { genUsername } from "../../utils/index.js";
import User from "../../models/user.model.js";
import generateToken from "../../lib/generateToken.js";

type UserData = Pick<IUser, "email" | "password" | "role">;

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body as UserData;
    if (!email || !password || !role) {
      res.status(404).json({
        success: false,
        message: "ALl field are required",
        data: null,
      } as IResponse);
      return;
    }
    if (!validator.isEmail(email)) {
      res.status(400).json({
        success: false,
        message: "please provide valid email",
      } as IResponse);
      return;
    }
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "password must be at least 8 character",
        data: null,
      } as IResponse);
    }
    const username = genUsername();
    const hashPassword = await bcrypt.hash(password, 10);
    if (!hashPassword) {
      res.status(400).json({
        success: false,
        message: "error do hash password",
      } as IResponse);
      return;
    }
    const findUserExist = await User.findOne({ email }).select("-password");
    if (findUserExist) {
      res
        .status(400)
        .json({ success: false, message: "User already exist" } as IResponse);
      return;
    }
    const newUser = await User.create({
      username,
      email,
      role,
      password: hashPassword,
    });
    const token = generateToken(newUser._id);
    if (!token) {
      res
        .status(404)
        .json({ success: true, message: "token generate error" } as IResponse);
      return;
    }
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      success: true,
      message: "user register successfully",
      data: newUser,
    } as IResponse);
  } catch (error: any) {

    res.status(500).json({
      success: false,
      message: "register error",
      error: error.message,
    } as IResponse);
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body as UserData;
    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      } as IResponse);
      return;
    }
    const findUser = await User.findOne({ email }).select("+password");
    if (!findUser) {
      res.status(400).json({
        success: false,
        message: "User not exist. Please register first",
      } as IResponse);
      return;
    }
    const comparePassword = await bcrypt.compare(password, findUser.password);
    if (!comparePassword) {
      res.status(400).json({
        success: false,
        message: "Wrong Email or password",
      } as IResponse);
      return;
    }
    const token = generateToken(findUser._id);
    if (!token) {
      res
        .status(400)
        .json({ success: false, message: "Token generate error" } as IResponse);
      return;
    }
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res
      .status(200)
      .json({ success: true, message: "Login successfully" } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Login internal error",
      error: error.message,
    } as IResponse);
  }
};

const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res
      .status(200)
      .clearCookie("token")
      .json({ success: true, message: "Logout successfully" } as IResponse);
  } catch (error: any) {
    res
      .status(500)
      .json({
        success: false,
        message: "logout internal error",
        error: error.message,
      } as IResponse);
  }
};

export { register, login, logout };
