//get normal objects array from db object array
function getNormalObjectArray(arr) {
    let newList = [];

    arr.forEach((element) => {
        newList.push(element.toObject());
    });

    return newList;
}

module.exports = {
    getNormalObjectArray
}