import usermodel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import crypto from "crypto";

export async function register(req, res) {
    const { username, email, password } = req.body;

    const userAlreadyRegister = await usermodel.findOne({
        $or: [{ username }, { email }]
    });

    if (userAlreadyRegister) {
        return res.status(409).json({
            message: "username or email is already registered"
        });
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    const user = await usermodel.create({
        username,
        email,
        password: hashedPassword
    });
    // jwt token generation

    const accessToken = jwt.sign(
        { id: user._id },
        config.jwtSecret,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        {id: user._id},
        config.jwtSecret,
        {expiresIn: "7d"}
    );
    // storing refreshToken on cookie
    res.cookie("refreshToken",refreshToken,{
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7*24*60*60*1000 // 7 day
    });

    return res.status(201).json({
        message: "User registered successfully",
        user: {
            username: user.username,
            email: user.email,
            accessToken
        }
    });
};


// verify the user by token sharing
export async function getme (req,res){
    const token = req.headers.authorization?.split(" ")[ 1 ];
    if(!token){
        return res.status(401).json({
            message:"token not found"
        })
    }

    const decoded = jwt.verify(token,config.jwtSecret)
    const user = await usermodel.findById(decoded.id)

    res.status(200).json({
        message: "user fetched successfully",
        user: {
            username: user.username,
            email: user.email
        }
    })
};

export async function refreshToken(req,res){
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401).json({
            message: "Refresh Token not found"
        })
    }

    const decoded = jwt.verify(refreshToken,config.jwtSecret)
    const accessToken = jwt.sign({
        id: decoded._id
        },config.jwtSecret,
        {
            expiresIn: "15m"
        }
    )

    res.status(200).json({
        message: "Acess Token refreshed successfully",
        accessToken
    })
};
