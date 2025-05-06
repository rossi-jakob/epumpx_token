const User = require('../models/User');

module.exports.createUserInfo = async (tgID, data) => {
  try {
    const _state = {
      tgID,
      publicKey: data.publicKey,
      privateKey: data.privateKey,
    }

    const newState = new User(_state);
    const savedState = await newState.save();
    return savedState;
  } catch (error) {
    console.error('MyWallet, createOne, error = ', error);
    return false;
  }
}

module.exports.getUserInfo = async (tgID) => {
  try {
    let user;
    user = await User.find({ tgID });
    return user;
  } catch (error) {
    console.error('Burned states, getBurnedStates, error = ', error);
    return null;
  }
}
