class Users {
    constructor() {
        this.users = [];
    }

    addUser(id, name, room) {
        const userInfo = {
            id,
            name,
            room
        };

        this.users.push(userInfo);
        return userInfo;
    }

    getUser(id) {
        const user = this.users.filter((user) => user.id === id)[0];
        return user;
    }

    removeUser(id) {
        const userToRemove = this.getUser(id);
        if (userToRemove) {
            this.users = this.users.filter((user) => user.id !== id);
        }

        return userToRemove
    }

    getUserList(room) {
        const usersInRoom = this.users.filter((user) => user.room === room);
        const userListNames = usersInRoom.map((user) => user.name);

        return userListNames;
    }
}

module.exports = {
    Users
};