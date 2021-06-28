const CLOUD_FRONT_DOMAIN = process.env.CLOUD_FRONT_DOMAIN;

function getPublicImage(image_name) {
    return `${CLOUD_FRONT_DOMAIN}/public_images/${image_name}`;
}

function getCsgoUtilAppFile(file_name) {
    return `${CLOUD_FRONT_DOMAIN}/csgo-util-app-public-files/${file_name}`;
}

function getCsgoUtilAppMap(map_id) {
    return `${CLOUD_FRONT_DOMAIN}/csgo-util-app-public-files/maps/${map_id}.png`;
}

function getCsgoUtilAppUtilIcon(icon_name) {
    return `${CLOUD_FRONT_DOMAIN}/csgo-util-app-public-files/icons/${icon_name}.png`;
}

function getCsgoUtilPublicImgs(util_id) {

    let location = `${CLOUD_FRONT_DOMAIN}/csgo-util-app-public-files/util_images/${util_id}/location.png`;
    let lineup = `${CLOUD_FRONT_DOMAIN}/csgo-util-app-public-files/util_images/${util_id}/lineup.png`;
    let result = `${CLOUD_FRONT_DOMAIN}/csgo-util-app-public-files/util_images/${util_id}/result.png`;

    return {
        location: location,
        lineup: lineup,
        result: result
    }
}

module.exports = {
    getPublicImage,
    getCsgoUtilAppFile,
    getCsgoUtilAppMap,
    getCsgoUtilAppUtilIcon,
    getCsgoUtilPublicImgs
}