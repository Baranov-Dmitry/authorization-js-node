import { makeAutoObservable } from "mobx";
import { IUser } from "../models/IUser";
import AuthService from "../services/AuthService";
import axios from "axios";
import { API_URL } from "../http";
import { AuthResponse } from "../models/response/AuthResponse";

export default class Store {
  user = {} as IUser;
  isAuth = false;
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setAuth(bool: boolean) {
    this.isAuth = bool;
  }

  setUser(user: IUser) {
    this.user = user;
  }

  setLoading(bool: boolean) {
    this.isLoading = bool;
  }

  async login(email: string, password: string) {
    try {
      const userData = await AuthService.login(email, password);
      localStorage.setItem("token", userData.data.accessToken);
      this.setAuth(true);
      this.setUser(userData.data.user);
    } catch (error) {
      // error?.response?.data?.message
      console.log(error);
    }
  }

  async registration(email: string, password: string) {
    try {
      const userData = await AuthService.registration(email, password);
      console.log(userData);
      localStorage.setItem("token", userData.data.accessToken);
      this.setAuth(true);
      this.setUser(userData.data.user);
    } catch (error) {
      // error?.response?.data?.message
      console.log(error);
    }
  }

  async logout() {
    try {
      await AuthService.logout();
      localStorage.removeItem("token");
      this.setAuth(false);
      this.setUser({} as IUser);
    } catch (error) {
      // error?.response?.data?.message
      console.log(error);
    }
  }

  async checkAuth() {
    this.setLoading(true);
    try {
      const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, {
        withCredentials: true,
      });
      console.log(response);
      localStorage.setItem("token", response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
    } catch (error) {
      console.log(error);
    } finally {
      this.setLoading(false);
    }
  }
}
