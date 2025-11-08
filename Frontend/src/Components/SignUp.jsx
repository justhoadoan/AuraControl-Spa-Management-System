import {react} from 'react';
import './SignUp.css';

const SignUp = () => {
    return (
        <div className="container">
            <div className="header">
                <div className="text">Sign Up</div>
            </div>
            <div className="inputs">
                <div className="input">
                    <input type="email" placeholder="email" />
                </div>
                <div className="input">
                    <input type="password" placeholder="password" />
                </div>
            </div>
            <div className="forgot-password">Forgot Password? Click here!</div>
            <div className="login-button">
                <button type="submit">Sign Up</button>
            </div>
        </div>
    );
}

export default SignUp;