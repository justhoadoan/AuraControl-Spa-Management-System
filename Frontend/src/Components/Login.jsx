import {react} from 'react';
import './Login.css';

const Login = () => {
    return (
        <div className="container">
            <div className="header">
                <div className="text">Log In</div>
            </div>
            <div className="inputs">
                <div className="input">
                    <input type="email" placeholder="email" />
                </div>
                <div className="input">
                    <input type="password" placeholder="password" />
                </div>
            </div>
            <div className="login-button">
                <button type="submit">Log In</button>
            </div>
        </div>
    );
}

export default Login;