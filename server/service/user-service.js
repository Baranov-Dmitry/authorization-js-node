const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const mailService = require("./mail-service");
const tokenService = require("../service/token-service");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exeptions/api-error");

class UserService {
  async registration(email, password) {
    // Проверям если он в бд
    const candidate = await UserModel.find({ email });
    if (candidate.length !== 0)
      throw ApiError.BadRequest(
        `Пользователь с почтовым адресом ${email} уже существует`
      );

    // создаем пользователя
    const hashPasword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();

    const user = await UserModel.create({
      email,
      password: hashPasword,
      activationLink,
    });

    await mailService.sendActivationMail(
      email,
      process.env.API_URL + "/api/activate/" + activationLink
    );

    const userDto = new UserDto(user); // id, email, isActivated
    const tokens = tokenService.generateToken({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    console.log(user);
    if (!user) {
      throw ApiError.BadRequest("Неверная ссылка для активации");
    }
    user.isActivate = true;
    user.save();
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest("Пользователь с таким email не существует");
    }

    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordEqual) {
      throw ApiError.BadRequest("Неправильный пароль");
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateToken({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnautarizationError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenData = await tokenService.findOne(refreshToken);

    console.log(userData, tokenData);

    if (!userData || !tokenData) {
      throw ApiError.UnautarizationError();
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    console.log(user, userDto);
    const tokens = tokenService.generateToken({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async getAllUsers() {
    const users = UserModel.find();
    return users;
  }
}

module.exports = new UserService();
