const AboutMe = require("../../db/models/public/aboutMe");
const AppDetails = require("../../db/models/public/appDetails");

const {
    dbDebugMsges
} = require("../../config/debug");

async function initApps() {
    const initData = {
        firstname: "Jordan",
        lastname: "Ho",
        email: "jordanhho@gmail.com",
        education_description: "I have a Bachelor of applied science degree from Simon Fraser. I major in computer science that specializes in software systems. I also have taken a BCIT course with Cisco IT admin training.",
        experience_description: "I have worked on several school projects to create web applications about scheduling, monitoring elevators, and site report writer. I have also done 2 co-ops where one is a full stack developer position and the other is a front-end only position. Through the full-stack position, I have worked on an education management system with my school to help professors and students manage school resources. At the front-end position, I have made many advancements and improvements on their man application.",
        specialization_description: "I find developing web applications really fun, especially when knowing the application is going to be useful for many people. I have fun optimizing and improving and existing applications while putting out my own ideas. I also really enjoy building a completely new application from the ground up while working with a serious team. Of course, constructing a completely new app is always tedious but these experiences are fun and valuable that I would like take my web development skills to the next level at my next job.",
        hobby_description: "I have previously competed professionally in the first-person shooter called Crossfire. This game requires reflexes, knowledge, the ability to think fast on your feet, and most importantly teamwork and communication. Through fierce competition, I have built up my communication and teamwork skills to work with many different players that I have also found that are easily applied to both school group work and at my co-ops. I have also competed as a high level amateur in csgo on ESEA main level league team. These skills honed at the game have helped me build a good work ethic and the ability to communicate and work with others well. In the end, I really like playing first-person shooters that are highly competitive that requires a high level of teamwork.",
        linkedin_url: "https://www.linkedin.com/in/jordanhho/",
        github_url: "https://github.com/Jordanhho",
        resume_url: "resume_link",
        youtube_url: "https://www.youtube.com/channel/UC8MYJwWZQr6c6Ryjkt6vv4Q",
        twitch_url: "https://www.twitch.tv/yuukicf",
        steam_url: "https://steamcommunity.com/profiles/76561198022667905",
        crossfire_profile_url: "https://www.crossfirestars.com/en/stats/player?playerNo=3298",
        esea_url: "https://play.esea.net/users/2282189",
    }
    await insertAboutMe(initData);
}


async function initAboutMe() {
    await insertApp({
        app_id: "csgo_utility_app",
        app_name: "CSGO Utility App",
        app_description: "A web application to allow competitive CSGO players to save a library of utility and share them privately with their team",
        github_url: "github_url",
        app_url: "todo_app_url",
        app_type: "web_app",
        is_wip: true
    });
    await insertApp({
        app_id: "overlay_translate_app",
        app_name: "Overlay Translate App",
        app_description: "An overlay windows application to translate anything on your computer screen on the fly.",
        github_url: "github_url",
        app_url: "todo_app_url",
        app_type: "windows_app",
        is_wip: true
    });
    await insertApp({
        app_id: "cite_cam",
        app_name: "Cite Cam App",
        app_description: "An Android application that creates an essay citation from a quick scan of a book barcode.",
        github_url: "github_url",
        app_url: "todo_app_url",
        app_type: "android_app",
        is_wip: true
    });
};

/** apps data manipulation */
async function insertApp(data) {
    try {
        const app = new AppDetails(data);
        const doc = await new Promise((resolve, reject) => {
            app.save(function (err, doc) {
                if (err) {
                    dbDebugMsges(err);
                    reject(null);
                }
                resolve(doc);
            });
        });
        dbDebugMsges("Successfully inserted app data", doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

//if id, update by id
async function upsertAppDetails(data) {
    try {
        const doc = await AppDetails.findOneAndUpdate(
            { app_id: data.app_id },
            data,
            { new: true, upsert: true }
        )
        if (!doc) {
            dbDebugMsges("No upsert executed, there already exists an identical entry", data.email);
            return null;
        }
        dbDebugMsges("Successfully upserted an app details", data.app_id, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function updateAppById(data) {
    try {
        const doc = await AppDetails.findOneAndUpdate(
            { app_id: data.app_id },
            data,
            { new: true }
        );
        if (!doc) {
            dbDebugMsges("No such app data found");
            return null;
        }
        dbDebugMsges("Successfully updated app data", doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function removeAppDetailById(app_id) {
    try {
        await AppDetails.deleteOne({ app_id: app_id });
        dbDebugMsges("Successfully removed the following app details", app_id);
        return true;
    } catch (err) {
        dbDebugMsges(err);
        return false;
    }
}

/** about me data manipulation */

async function insertAboutMe(data) {
    try {
        const aboutMe = new AboutMe(data);
        const doc = await new Promise((resolve, reject) => {
            aboutMe.save(function (err, doc) {
                if (err) {
                    dbDebugMsges(err);
                    reject(null);
                }
                resolve(doc);
            });
        });
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function updateAboutMe(data) {
    console.log(data);
    try {
        const doc = await AboutMe.findOneAndUpdate(
            {},
            data,
            { new: true }
        );
        if (!doc) {
            dbDebugMsges("No such aboutMe data found");
            return null;
        }
        dbDebugMsges("Successfully updated aboutMe data", doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

module.exports = {
    insertApp,
    upsertAppDetails,
    removeAppDetailById,
    updateAppById,

    insertAboutMe,
    updateAboutMe
}