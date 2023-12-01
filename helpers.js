//helper function
const getUserByEmail = function (email, database) {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
};

module.exports = { getUserByEmail };
