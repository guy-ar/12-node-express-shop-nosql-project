exports.getErrorPage = (req, res, next) => {
    if (err.code === 'CSRF_INVALID') {
      return res.status(403).render('error', {
        docTitle: 'Error Page',
        path: '',
        message: 'CSRF validation failed' 
      });
    }
    res.status(404).render('404', {
      docTitle: 'Error Page',
      path: ''
    });
}