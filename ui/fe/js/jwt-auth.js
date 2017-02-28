
/**
 * JWT authentication for TPA API.
 *
 * A user signs in with JWT. This is stored in localstorage
 * with the refresh date so that it can be refreshed or expired as necessary.
 * 
 * On the server side, the user's current tenant
 *
 */

import * as d3 from "d3";

export class JWTAuth {
    constructor(auth_url_base, local_storage=true) {
        this.auth_url_base = auth_url_base;
        this.storage = local_storage ? localStorage : sessionStorage;
        this.dispatch = d3.dispatch("login", "logout", "denied", "error");
        this.login_display_handler = function null_handler() {};
    }

    set_login_display(handler) {
        this.login_display_handler = handler;
    }

    display_login(on_success) {
        this.login_display_handler(on_success);
    }

    set_token(username, token) {
        console.log("JWT token:", token);
        this.storage.setItem('jwt_auth_username', username);
        this.storage.setItem('jwt_auth_token', token);
        this.storage.setItem('jwt_auth_token_timestamp',
            (token === undefined || token === null) ? null : Date()
        );
    }

    login(username, password, callback) {
        let auth = this;

        d3.request(this.auth_url_base+'login/')
            .header("Content-Type", "application/json")
            .on('load', function(xhr) {
                let json_response = JSON.parse(xhr.responseText);

                auth.set_token(username, json_response.token);
                auth.dispatch.call("login");
                callback(null, json_response.token);
            })
            .on('error', function(error) {
                console.log("Login failed:", error);
                auth.set_token(null, null);
                auth.dispatch("denied");
                callback(error);

            })
            .send('POST', JSON.stringify({
                'username': username,
                'password': password
            }));
    }

    on(event, callback) {
        return this.dispatch.on(event, callback);
    }

    get logged_in() {
        return (this.storage.getItem('jwt_auth_token') ? true : false);
    }

    get username() {
        return this.storage.getItem('jwt_auth_token') ?
            this.storage.getItem('jwt_auth_username')
            : "";
    }

    logout() {
        this.set_token(null, null);
        this.dispatch.call("logout");
    }

    json_request(url) {
        var auth_token = this.storage.getItem("jwt_auth_token");
        var bearer = (auth_token === null || auth_token === undefined) ?  ""
                : ("JWT " + auth_token);

        return d3.request(url)
            .mimeType("application/json")
            .header("Authorization", bearer)
            .response(r => JSON.parse(r.responseText));
    }
}
