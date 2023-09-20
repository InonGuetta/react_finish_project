const bcrypt = require("bcrypt");

const User = require('../models/user');
const AgesScale = require('../models/ageScales');

class UserService {

  async getUserByUsername(username) {
    try {
      const user = await User.findOne({ username });
      return user;
    } catch (error) {
      throw new Error('Error fetching user data');
    }
  }

  async getUserByMail(mail) {
    try {
      const user = await User.findOne({ mail });
      return user;
    } catch (error) {
      throw new Error('Error fetching user data');
    }
  }

  async createUser(userData) {
    const { mail, username, password, firstName, lastName,
      gender, age, address, about } = userData;

    // validate is not exist
    await this.checkUserExistence(userData);

    // create
    let user = new User({
      mail, username, firstName, lastName,
      gender, age, address, about, isAdmin: false
    });

    // hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // save the new user
    await user.save();

    console.log("NEW USER CREATED - ", user.username);

    return user;
  }

  async checkUserExistence({ mail, username }) {
    const userByMail = await User.findOne({ mail });
    if (userByMail) {
      throw new Error("מייל זה כבר רשום במערכת.");
    }
    const userByUsername = await User.findOne({ username });
    if (userByUsername) {
      throw new Error("שם משתמש זה הינו תפוס");
    }
  }

  async searchUsers(query) {

    let { gender, ageScales } = query;
    let queryToFind = {};
    try {

      if (ageScales >= 0) {
        let { minAge, maxAge } = await this.convertScalesToInt(ageScales);
        queryToFind.age = { $gte: minAge, $lte: maxAge };
      }

      if (gender === 0 || gender === 1) {
        queryToFind.gender = gender;
      }

      const foundUsers = await User.find(queryToFind);
      return foundUsers;

    } catch (error) {
      throw new Error('something failed. please contact us');
    }
  }

  async convertScalesToInt(ageScalesId) {
    const { text } = await AgesScale.findOne({ id: ageScalesId });

    let minAge = parseInt(text.slice(0, 2));
    let maxAge = parseInt(text.slice(-2));

    return { minAge, maxAge }

  }
}



module.exports = new UserService();
