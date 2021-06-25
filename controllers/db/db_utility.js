//converts db Object to a javascript object
function getNormalObjFromDoc(doc, safe = true) {
    let normalObj = doc;
    //removing sensitive information such as "_id" and "__v"
    if(safe) {
        normalObj = removeFieldsFromObj(normalObj, ["_id", "__v"]);
    }
    return normalObj;
}

//given an object, delete all provided fields that matches the key.
function removeFieldsFromObj(obj, fieldsToRemove) {
    for (let currKey in obj) {
        //skip _id as its a mongoose object
        //if object and not array
        if (typeof obj[currKey] == "object" && currKey !== "_id" ) {
            delete obj.currKey;
            let newJsonData = removeFieldsFromObj(obj[currKey], fieldsToRemove);
            obj[currKey] = newJsonData;
        } 
        else {
            for (let key of fieldsToRemove) {
                if (currKey === key) {
                    delete obj[currKey];
                }
            }
        }
    }
    return obj;
}

module.exports = {
    getNormalObjFromDoc
}