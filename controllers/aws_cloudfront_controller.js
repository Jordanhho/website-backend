const CLOUD_FRONT_DOMAIN = process.env.CLOUD_FRONT_DOMAIN;

function getPublicImage(image_name) {
    return `${CLOUD_FRONT_DOMAIN}/public_images/${image_name}`;
}

module.exports = {
    getPublicImage
}