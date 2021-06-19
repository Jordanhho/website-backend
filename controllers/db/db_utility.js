//converts db Object to a javascript object
function getDbObjToObj(doc, safe = true) {
    let newObj = doc.toObject();
    if(safe) {
        return getSafeDbObj(newObj);
    }
    else {
        return newObj;
    }
}

//get normal objects array from db object array
function getNormalObjectArray(arr, safe = true) {
    let newList = [];

    arr.forEach((element) => {
        if(safe) {
            newList.push(getSafeDbObj(element.toObject()));
        }
        else {
            newList.push(element.toObject());
        }
    });

    return newList;
}

//removes sensitive information such as _id and __v from database object.
function getSafeDbObj(doc) {
    let newDbObj = { ...doc};
    delete newDbObj._id;
    delete newDbObj.__v;
    return newDbObj;
}

module.exports = {
    getDbObjToObj,
    getNormalObjectArray,
    getSafeDbObj
}