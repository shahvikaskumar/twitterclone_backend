const converttime = function (next) {
    
    // Function to convert timestamp to GMT+5:30 timezone
    const convertToGMT530 = (date) => {
        const gmt530Offset = 5.5 * 60 * 60 * 1000;
        return new Date(date.getTime() + gmt530Offset);
    };

    // If it's a new user, set createdAt timestamp and convert it to GMT+5:30 timezone
    if (this.isNew) {
        this.createdAt = convertToGMT530(this.createdAt);
    }

    // Convert updatedAt timestamp to GMT+5:30 timezone
    this.updatedAt = convertToGMT530(this.updatedAt);

    // Call the next middleware
    next();
};

module.exports= converttime;