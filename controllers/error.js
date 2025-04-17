exports.getGeneralErrorPage = (req, res, next) => {
    res.status(500).render('500', {
      docTitle: 'Error Page',
      path: ''
    });
}

exports.getNotFoundErrorPage = (req, res, next) => {
  res.status(404).render('404', {
    docTitle: 'Page Not Found',
    path: ''
  });
}