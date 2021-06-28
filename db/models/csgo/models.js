module.exports = function (mongoose) {
    //schemas
    //save to the collection(dbname) called "db" on the cluster0
    const Schema = mongoose.Schema
    const baseMapDataSchema = new Schema({
        "awsS3ItemId": {
            "type": "Number"
        },
        "mapId": {
            "type": "String"
        },
        "mapName": {
            "type": "Date"
        }
    });
    const imgListSchema = new Schema({
        "awsS3ItemId": {
            "type": "Number"
        },
        "imgName": {
            "type": "String"
        },
        "imgInstruction": {
            "type": "String"
        }
    });
    const utilDataSchema = new Schema({
        "imgList": [imgListSchema], //defined schema above
        "mapId": {
            "type": "String"
        },
        "is64Tick": {
            "type": "Boolean"
        },
        "is128Tick": {
            "type": "Boolean"
        },
        "shiftJumpThrow": {
            "type": "Boolean"
        },
        "shiftThrow": {
            "type": "Boolean"
        },
        "jumpThrow": {
            "type": "Boolean"
        },
        "runThrow": {
            "type": "Boolean"
        },
        "standThrow": {
            "type": "Boolean"
        },
        "isCTSide": {
            "type": "Boolean"
        },
        "isTSide": {
            "type": "Boolean"
        },
        "utilType": {
            "type": "String"
        },
        "initPosCoord": {
            "x": {
                "type": "Number"
            },
            "y": {
                "type": "Number"
            }
        },
        "targetPosCoord": {
            "x": {
                "type": "Number"
            },
            "y": {
                "type": "Number"
            }
        }
    });

    const userDataSchema = new Schema({
        "username": {
            "type": "Number"
        },
        "level": {
            "type": "String"
        },
        "completed": {
            "type": "Boolean"
        }
    });

    
/* 
    var baseMapDataModel = mongoose.model('BaseMap', baseMapDataSchema, 'db');
    var utilDataModel = mongoose.model('Util', utilDataSchema, 'db');

 */
    // declare seat covers here too
    var models = {
        BaseMapModel: mongoose.model('base_map_data', baseMapDataSchema, "base_map_data"),
        UtilModel: mongoose.model('util_data', utilDataSchema, "util_data"),
        UserModel: mongoose.model('user_data', utilDataSchema, "user_data"),
    };
    return models;
}