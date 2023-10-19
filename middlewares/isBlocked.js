module.exports = {
    isBlocked: (req, res, next) => {
        try {
            console.log('ssssssssssssssssssssssssssssssssssssssssssssss');
            console.log('req.user:::::::::::', req.user);
            if (!req.user.isActive) {
                console.log('wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwws');
                return res.status(403).json({ message: 'User is blocked.' });
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
