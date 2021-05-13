const bcrypt = require('bcrypt');

//set salt gen
const saltRounds = 10;

const getHashedPassword = (password) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
}

//compares the attempt hashed password with the hashedpassword from db
const compareHashedPassword = (attemptHashedPassword, hashedPassword) => {

    console.log("testing: ", attemptHashedPassword)
    console.log("comparing: ", attemptHashedPassword, " : ", hashedPassword)

    console.log("same pass?: ", (attemptHashedPassword === hashedPassword ));

    return bcrypt.compareSync(attemptHashedPassword, hashedPassword);
}

// //compares the unhashed password to hashedpassword
// const compareUnhashedPassword = async (attemptPassword, hashedPassword) => {



//     const attemptHashedPassword = await getHashedPasswordAsync(attemptPassword);

//     console.log("testing: ", attemptPassword)
//     console.log("comparing: ", attemptHashedPassword, " : ", hashedPassword)

//     return bcrypt.compareSync(attemptHashedPassword, hashedPassword);
// }


const getHashedPasswordAsync = async (password) => {
    try {
        //generate salt
        const salt = await bcrypt.genSalt(saltRounds);
        //hash password with salt
        return bcrypt.hash(password, salt);
    } catch (err) {
        console.log(err);
        return err;
    }
}

//compares the attempt hashed password with the hashedpassword from db
const compareHashedPasswordAsync = async (attemptHashedPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(hashedPassword, hash);
    } catch (err) {
        console.log(err);
        return err;
    }
}

module.exports = { 
    getHashedPassword, 
    compareHashedPassword
};