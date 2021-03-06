import Player from '../model/player.js';

class Api {
    constructor() {
        this.headers = new Headers();
        this.jwt = '';
        Promise.all([this.init()]);
    }

    init() {
        this.initializationPromise = new Promise((resolve, reject) => {
            const urlParams = new URLSearchParams(window.location.search);
            if (!urlParams.has('jwt') && localStorage.getItem('security.jwt') === null) {
                window.location = `${config.portalUrl}/dashboard`;
                return reject();
            } else if (urlParams.has('jwt')) {
                localStorage.setItem('security.jwt', urlParams.get('jwt'));
                window.location = '/';
                return resolve();
            }
            this.jwt = localStorage.getItem('security.jwt');
            this.headers.append('Authorization', `Bearer ${this.jwt}`);
            return resolve();
        });
        return this.initializationPromise;
    };

    responseMiddleware(response) {
        if (response.status === 401) {
            Player.logout();
            return Promise.reject("unauthorized");
        }
        if (response.ok) {
            return response.json();
        }
    };
}

export default new Api();
