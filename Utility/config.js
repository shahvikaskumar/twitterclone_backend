require('dotenv').config();

module.exports = {
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    Email:process.env.Email,
    Pass:process.env.Pass,    
    Fronturl:process.env.Fronturl,
    Cname:process.env.Cname,
    Capikey:process.env.Capikey,
    Capisecret:process.env.Capisecret,
    Capienvvar:process.env.Capienvvar,
};