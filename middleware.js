export  function isLoggedIn(req, res, next){
    console.log(req.user);
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        
        return res.redirect("/login");
    }
    next();
}