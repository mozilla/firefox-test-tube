import queryString from 'query-string';


export default class {
    constructor(location, history) {
        this.location = location;
        this.history = history;
    }

    getQueryParameter(key) {
        const qp = queryString.parse(this.location.search);
        return qp[key];
    }

    addQueryParameter(key, value) {
        const qp = queryString.parse(this.location.search);
        qp[key] = value;
        this.history.push(this.location.pathname + '?' + queryString.stringify(qp));
    }

    removeQueryParameter(key) {
        const qp = queryString.parse(this.location.search);
        delete qp[key];
        this.history.push(this.location.pathname + queryString.stringify(qp));
    }
}
