//Validate email format
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
    return password && password.length >= 8;
};

// Validate login form
export const validateForm = (email, password) => {
    const errors = {};

    if(!validateEmail(email)){
        errors.email = 'Invalid email format';
    }
    else if(!email.trim()){
        errors.email = 'Email is required';
    }

    // Password validation
    if (!password) {
        errors.password = 'Password is required';
    } else if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
    }

    return errors;
};