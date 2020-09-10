import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import axios from 'axios';
import * as serviceWorker from './serviceWorker';
var token = localStorage.getItem('token')
if (token) {
    axios.defaults.headers.common['token'] = token;
    axios.get('/login').then(({ data }) => {
        localStorage.setItem('user', JSON.stringify(data.user))
        console.log(window.location.href);
        if (window.location.href == "http://localhost:3000/") {
            window.location.href = "http://localhost:3000/dashboard";
        }
    }).catch(() => {
        // this.props.props.history.push("/");
        delete axios.defaults.headers.common['token'];
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.href == "http://localhost:3000/") {
            window.location.href = "http://localhost:3000/";
        }
    })
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
