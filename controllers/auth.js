exports.getLogin = (req, res, next) => {
    console.log("Cookies: ");
    console.log(req.get('Cookie'));
    const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
    console.log(isLoggedIn);
    res.render('auth/login', {
        path: '/login',
        docTitle: 'Login',
        isAuthenticated: isLoggedIn
    });

}

exports.postLogin = (req, res, next) => {
    // assume login is valid - later on we will validate the login
    // set cookies for login
    res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly')
    res.redirect('/');

}