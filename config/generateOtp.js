module.exports = function generateOtp() {
    const characters = '0123456789';
    const charactersLength = characters.length;
    let OTP = '';

    for (let i = 1; i <= 6; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        OTP += characters.charAt(randomIndex);
    }
    return OTP
}