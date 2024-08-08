const users = [];

function findUserByUsername(username) {
    return users.find(user => user.username === username);
}

function findUserById(id) {
    return users.find(user => user.id === id);
}

function addUser(username, password) {
    const id = users.length + 1;
    users.push({ id, username, password });
}

module.exports = { users, findUserByUsername, findUserById, addUser };
