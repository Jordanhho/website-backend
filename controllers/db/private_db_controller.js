const AboutMe = require("../../db/models/public/aboutMe");
const AppDetails = require("../../db/models/public/appDetails");
const AdminSettings = require("../../db/models/admin/adminSettings");

const {
    dbDebugMsges
} = require("../../config/debug");

async function initAdminSettings() {
    insertAdminSettings()
}


/** initialization of db collections */
async function initApps() {
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
}

async function initAboutMe() {
    const initData = {
        firstname: "Jordan",
        lastname: "Ho",
        email: "jordanhho@gmail.com",

        education_description: "I have graduated from Simon Fraser University in 2020 with a Bachelor of Science degree. I major in Software Systems, a specialization of a computer science degree. I have also taken a course at Cisco Networking Academy for IT Essentials and CCNA.",

        school_experience_description: "I have worked on several web applications for school projects. The applications were a VueJS scheduling application, a VueJS elevator monitoring application, and an Angular onsite work report writer application.Through working on these projects, I have developed my teamwork skills to be able to adapt to different group members.",

        work_experience_description: "I have done 2 co-ops during my undergraduate studies.< br />My first co- op was at Simon Fraser University's School of Business where I worked with a team of 6 in agile as a Full-Stack Web Developer. During the co-op, I have worked on improving and extending their education management systems for professors, advisors, and students using PHP and JQuery. I have also helped them build from the ground up a new ReactJS application for future purposes. < br /> My second co - op was at Celayix where I worked with a team of 10 in agile as a Front - end Web Application Developer.Celayix is a software company that develops a scheduling application to make scheduling easy.During this co - op, my responsibilities were to fix bugs and implement new features for the app.I have also worked with QA and UX developers. ",

        skill_specialization_description: "My main development languages include Javascript, Java, C, PHP, and Python. < br /> For software suites, I am familiar with using Jetbrain programs, Visual Studio, JIRA, Youtrack, and Confluence project management trackers. < br /> I am also familiar with using Google Cloud Platform, AWS, Docker, and Git. < br /> For operating systems, I am very familiar with using Ubuntu Linux, Mac, and Windows 10. <br/> My main javascript frameworks I use is ReactJS, JQuery, and NodeJS. <br /> For databases I am familar with using MySQL and MongoDB. ",

        hobby_description: "My hobbies include playing video games with friends, and watching Japanese Anime. I'm also a very competitive person, so I enjoy competing at video games.",

        esports_description: "I have previously competed professionally in the Tecent Sponsored First Person Shooter game called Crossfire. This game requires fast reflexes and thinking, but also requires strong communication and teamwork skills. It also requires a steady level of work ethics to train yourself to be at the top of the game. I have also competed at a high amateur level in Counter-Strike Global Offensive ESEA that helped me further develop my teamwork and communication skills to seamlessly work with my teammates. Through competing in esports with many teams, I have developed my teamwork and communication skills to a high level that were easily applied to my workplaces and school project work. ",

        goal_description: "I am currently looking for a job that is in the web development industry. I am interested in Full-stack web development positions that use ReactJS. I am confident that I can apply the skills I have developed and gained from my co-ops, school projects, and esports teamwork experience at your company. My contact me at my email details below.  ",

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
};

async function initAdminSettings() {
    await insertAdminSettings({
        enable_new_accounts: false,
        enable_emailing: false,
        enable_change_password: false
    });
}

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

/** admin settings */

async function insertAdminSettings(data) {
    try {
        const adminSettings = new AdminSettings(data);
        const doc = await new Promise((resolve, reject) => {
            adminSettings.save(function (err, doc) {
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

async function updateAdminSettings(data) {
    try {
        const doc = await AdminSettings.findOneAndUpdate(
            {},
            data,
            { new: true }
        );
        if (!doc) {
            dbDebugMsges("No such admin settings found");
            return null;
        }
        dbDebugMsges("Successfully updated admin settings", doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getAdminSettings() {
    try {
        const doc = await AdminSettings.findOne();
        if (!doc) {
            dbDebugMsges("No such admin settings found");
            return null;
        }
        dbDebugMsges("Successfully found admin settings", doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

module.exports = {
    initAboutMe,
    initApps,
    initAdminSettings,

    insertApp,
    upsertAppDetails,
    removeAppDetailById,
    updateAppById,

    insertAboutMe,
    updateAboutMe,
    
    insertAdminSettings,
    updateAdminSettings,
    getAdminSettings
}