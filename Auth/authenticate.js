const { admin } = require("./firebase.config.js");

exports.authenticate = async (request) => {
    const token = request.headers.auth;

    if (!token) {
        return Promise.reject({ status: 403, msg: "No Authentication Token" });
    }

    return admin
        .auth()
        .verifyIdToken(token)
        .catch(() => {
            return Promise.reject({
                status: 403,
                msg: "Authentication Failed",
            });
        });
};
