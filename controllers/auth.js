exports.getLogin = (req, res, next) => {
    // console.log("Cookies: ");
    // console.log(req.get('Cookie'));
    // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
    console.log(req.session.isLoggedIn);
    res.render('auth/login', {
        path: '/login',
        docTitle: 'Login',
        isAuthenticated: false
    });

}

exports.postLogin = (req, res, next) => {
    // assume login is valid - later on we will validate the login
    // set on session flag for login
    req.session.isLoggedIn = true;
    res.redirect('/');

}