import { Response, Request } from "express";
import User from "../../models/user.model.js";
import { IResponse } from "../../interfaces/responseInterface.js";
import bcrypt from "bcryptjs";

const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req;
    const { role } = req.body;
    if (!role || !userId) {
      res.status(400).json({
        success: false,
        message: "role or id not define",
      } as IResponse);
    }
    const user = await User.findById({ _id: userId }).select("-password");
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "user not find" } as IResponse);
      return;
    }
    if (user.role !== role) {
      res.status(500).json({
        success: false,
        message: "Sorry you don't have access",
      } as IResponse);
      return;
    }
    res.status(200).json({ success: true, data: user } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal getCurrentUser error",
      error: error.message,
    } as IResponse);
  }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req;
    const {
      firstName,
      lastName,
      username,
      password,
      email,
      website,
      facebook,
      youtube,
      instagram,
      x,
      linkedIn,
    } = req.body;
    const existingUser = await User.findById({
      $or: [{ email }, { username }],
      _id: { $ne: userId },
    });

    if (existingUser) {
      res.status(404).json({
        success: false,
        message: "Email or UserName already exist",
      } as IResponse);
      return;
    }
    const update: any = {
      firstName,
      lastName,
      username,
      password,
      email,
      website,
      facebook,
      youtube,
      instagram,
      x,
      linkedIn,
    };
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true }
    ).select("-password");
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "user not updated" } as IResponse);
      return;
    }
    res.status(200).json({
      success: true,
      message: "user update",
      data: update,
    } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal updateUser error",
      error: error.message,
    } as IResponse);
  }
};

const deleteCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req;
    const user = await User.deleteOne({ _id: userId });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "error to delete user",
      } as IResponse);
      return;
    }
    res
      .status(204)
      .json({ success: true, message: "User deleted" } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal delete current user error",
      error: error.message,
    } as IResponse);
  }
};

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit =
      parseInt(req.query.limit as string)! ??
      Number(process.env.defaultResLimit);
    const offset =
      parseInt(req.query.offset as string)! ??
      Number(process.env.defaultResOffset);
    const total = await User.countDocuments();
    const user = await User.find({})
      .select("-password")
      .limit(limit)
      .skip(offset)
      .lean()
      .exec();
    if (!user) {
      res.status(404).json({
        success: false,
        message: "error to get all user",
      } as IResponse);
      return;
    }
    res.status(200).json({
      success: true,
      data: { limit, offset, total, user },
    } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal get All user error",
      error: error.message,
    } as IResponse);
  }
};

const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    const user = await User.findById({ _id: userId }).select("-password");
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "user not find" } as IResponse);
      return;
    }
    res.status(200).json({ success: true, data: user } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal get user error",
      error: error.message,
    } as IResponse);
  }
};
const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    const user = await User.findByIdAndDelete({ _id: userId });
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "user not find" } as IResponse);
      return;
    }
    res
      .status(204)
      .json({ success: true, message: "user delete" } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal delete user by id error",
      error: error.message,
    } as IResponse);
  }
};

export {
  getCurrentUser,
  updateUser,
  deleteCurrentUser,
  getAllUsers,
  getUser,
  deleteUser,
};
