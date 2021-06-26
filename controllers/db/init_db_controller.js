const { nanoid } = require("nanoid");

const {
    insertAboutMe,
    insertAdminSettings,
    upsertJordanHo,
    upsertResumeDisplay,
    upsertAppDetails,
    upsertBucketFile,
    updateAboutMe
} = require("./private_db_controller");

async function initAdminSettings() {
    await insertAdminSettings({
        enable_new_accounts: false,
        enable_emailing: false,
        enable_change_password: false
    });
}

async function initJordanHo() {
    await upsertJordanHo({
        email: "jordanhho@gmail.com",
        firstname: "Jordan",
        lastname: "Ho",
        linkedin_url: "https://www.linkedin.com/in/jordanhho/",
        github_url: "https://github.com/Jordanhho",
        resume_url: "resume_link",
        youtube_url: "https://www.youtube.com/channel/UC8MYJwWZQr6c6Ryjkt6vv4Q",
        twitch_url: "https://www.twitch.tv/yuukicf",
        steam_url: "https://steamcommunity.com/profiles/76561198022667905",
        crossfire_profile_url: "https://www.crossfirestars.com/en/stats/player?playerNo=3298",
        esea_url: "https://play.esea.net/users/2282189",
        website_frontend_github_url: "https://github.com/Jordanhho/website-frontend",
        website_backend_github_url: "https://github.com/Jordanhho/website-backend",
        resume_file_id: "0WaYu7zdqicFdxkeMLBGW",
        profile_picture_file_id: "profile_picture_id"
    });
}

async function initResumeDisplay() {
    await upsertResumeDisplay({
        resume_file_id: "0WaYu7zdqicFdxkeMLBGW",
        education: [
            {
                education_name: "Bachelor of Science - Major in Software Systems",
                school_name: "Simon Fraser University",
                date_start: "September 2014",
                date_end: "May 2020",
                location: "Burnaby, BC",
                education_description: "Software Systems is a Computer Science degree with a specialization in software development."
            },
            {
                education_name: "ACE-IT Cisco Computer Networking Technician",
                school_name: "Burnaby South Secondary",
                date_start: "September 2014",
                date_end: "May 2020",
                location: "Burnaby, BC",
                education_description: "This is a Cisco Networking Academy Course that covers Cisco's IT Essentials, and CCNA."
            },
            {
                education_name: "General Education",
                school_name: "Burnaby South Secondary",
                date_start: "September 2009",
                date_end: "June 2014",
                location: "Burnaby, BC",
                education_description: ""
            },
        ],
        school_experience: [
            {
                project_for: "SFU’s Safety Engagement Program",
                project_name: "Scheduling Web App",
                position_name: "Full Stack Web Developer",
                date_start: "September 2017",
                date_end: "December 2017",
                experience_description: "For a school project, I have developed with a team of 8 in agile for a web application. The web application's purpose is to schedule and manage work shifts with the ability to optimize the scheduling between workers. The application's front-end has been developed with VueJS, Vuetify UI framework. The back-end has been developed with Java, and its database is SQLite. I have also managed the git repository for the project.",
                technologies: [
                    "VueJS",
                    "Javascript",
                    "HTML",
                    "CSS",
                    "Java",
                    "SQLite"
                ]
            },
            {
                project_for: "VDF Vertical",
                project_name: "Independent Elevator Monitoring System",
                position_name: "Full Stack Web Developer, Embedded Developer",
                date_start: "September 2017",
                date_end: "December 2017",
                experience_description: "For another school project, groups in our class were competing to come up with a low-cost solution for a secondary elevator monitoring system with a microprocessor for the company VDF Vertical. I have developed with a team of 4 to create an independent elevator monitor system that utilizes a distance measurement laser with the microprocessor. We have implemented a C-embedded back-end server to connect with the microprocessor. We have also implemented a NodeJS server to host the web application that is fed from the microprocessor with a MongoDB database. The front-end has been developed with VueJS and Bootstrap.",
                technologies: [
                    "C",
                    "Microprocessor",
                    "VMs",
                    "VueJS",
                    "Javascript",
                    "HTML",
                    "CSS",
                    "MongoDB"
                ]
            },
        ],
        programming_languages_comfortable_with: [
            "ReactJS",
            "NodeJS",
            "Redux",
            "Javascript",
            "JQuery",
            "PHP",
            "HTML",
            "CSS",
            "Python",
            "Java",
            "C",
            "MySQL",
            "MongoDB",
            "Mongoose",
            "ExpressJS"
        ],
        programming_languages_experienced_with: [
            "C++",
            "Apache",
            "Nginx",
            "VueJS",
            "AngularJS",
            "GoLang",
            "Matlab",
            "Intel x86 Assembly"
        ],
        technologies_comfortable_with: [
            "Git Version Control",
            "BitBucket",
            "Agile Methodology",
            "Virtual Machines",
            "Visual Studios",
            "Jira",
            "YouTrack",
            "Confluence",
            "Windows 7, 10",
            "Mac OS X",
            "Linux Ubuntu",
            "Jetbrain Development Suite",
            
        ],
        technologies_experienced_with: [
            "Postman",
            "Google Cloud Platform",
            "Docker",
            "Kubernetes",
            "Amazon Web Services (AWS)",
            "AWS S3",
            "AWS CloudFront",
            "CloudFlare",
            "Android Development",
            "Photoshop"
        ],
        work_experience: [
            {
                company_name: "Celayix",
                position_name: "Front-end Web Developer Co-op",
                date_start: "January 2019",
                date_end: "August 2019",
                experience_description: "At Celayix, I have worked as a front-end web app developer for a shift scheduling web application to make scheduling easy. I worked with a team of 10 in agile to fix, improve or add new features to the scheduling application with ReactJS, HTML, and CSS. I have worked with the UX designers and mockups to implement front-end features. I have also worked with back-end developers to use their APIs to develop features. We managed our workflow sprints with YouTrack and documented them with Confluence.",
                location: "Vancouver, BC",
                website_url: "https://www.celayix.com/",
                technologies: [
                    "ReactJS",
                    "Javascript",
                    "HTML",
                    "CSS",
                    "AWS",
                    "Google Maps API",
                    "Concluence"
                ]
            },
            {
                company_name: "Beedie School of Business",
                position_name: "Full Stack Web Developer Co-op",
                date_start: "May 2018",
                date_end: "December 2018",
                experience_description: "I have worked at SFU's Beedie School of Business as a Full Stack Web developer. I have worked with a team of 6 in agile to improve and extend the school's Teaching Research And Collaboration System (TRACS) which is a web education management system application. My work includes fixing bugs and implementing new features with the back-end PHP and the front-end's JQuery, HTML, CSS, and Javascript. Our work process also includes working with JIRA, tickets, and documenting with confluence. I have also worked with clients and Business Analysts in gathering requirements data. I have also designed and implemented our database with MySQL. During my co-op there, I have also implemented from scratch their new ReactJS powered Web application for future-proofing their system. ",
                location: "Burnaby, BC",
                website_url: "https://beedie.sfu.ca/",
                technologies: [
                    "PHP",
                    "JQuery",
                    "Javascript",
                    "HTML",
                    "CSS",
                    "ReactJS",
                    "Apache",
                    "CodeIgniter",
                    "MySQL",
                    "JIRA",
                    "Confluence"
                ]
            },
        ],
        year_gap_start: "May 2020",
        year_gap_end: "April 2021",
        year_gap_description: "During early high school and university, I have competed professionally in Esports at Tecent's First Person Shooter game called Crossfire. Unfortunately, an unforeseen incident happenned that prevented me from continuing my venture in that game. I had planned after finishing my university degree to spend a maximum of one year solely pursuing my dream of competing professionally in Esports at a similar game called Counter Strike Global Offensive(CSGO). After graduating from university, I had focused on climbing the ranks of the ESEA CSGO League along with my teammate from Crossfire. Unfortunately, after nearing my goal, I had suffered from burnout and stress, so I have decided to take a break indefinitely from Esports."
    });
}

/** initialization of db collections */
async function initApps() {
    await upsertAppDetails({
        app_id: "csgo_utility_app",
        app_name: "CSGO Utility App",
        app_description: "A web application to allow competitive CSGO players to save a library of utility and share them privately with their team",
        github_url: "https://github.com/Jordanhho/csgo-utility-app",
        app_url: "",
        app_type: "web_app",
        is_wip: true,
        is_github_private: false
    });
    await upsertAppDetails({
        app_id: "overlay_translate_app",
        app_name: "Overlay Translate App",
        app_description: "An overlay windows application to translate anything on your computer screen on the fly.",
        github_url: "https://github.com/Jordanhho/overlay-translate-app",
        app_url: "",
        app_type: "windows_app",
        is_wip: true,
        is_github_private: false
    });
    await upsertAppDetails({
        app_id: "cite_cam",
        app_name: "Cite Cam App",
        app_description: "An Android application that creates an essay citation from a quick scan of a book barcode.",
        github_url: "github_url",
        app_url: "todo_app_url",
        app_type: "android_app",
        is_wip: true,
        is_github_private: true
    });
}

async function initAboutMe() {
    const initData = {
        profile_picture_file_id: "08mFG_aG44aw34qMV6g1i",
        personality_and_passion: "I'm not an outdoor person as you can probably see. I am an introverted person, however I enjoy hanging out with friends, and working with people I am really familar with. I am a shy person, however I feel I become very lively when I get to know people well. I am also a very one track minded person where if I am motivated for a single thing, I'll devote my full efforts into developing that passion or work. I have a very strong work ethic and will to pursue perfection in the quality of my work.",

        esports_description: "I have previously competed professionally in the Tecent Sponsored First Person Shooter game called Crossfire. This game requires fast reflexes and thinking, but also requires strong communication and teamwork skills. It also requires a steady level of work ethic to train yourself to be at the top of the game. I have also competed at a high amateur level in Counter-Strike Global Offensive ESEA that helped me further develop my teamwork and communication skills to seamlessly work with my teammates. Through competing in esports with many teams, I have developed my teamwork and communication skills to a high level that were easily applied to my workplaces and school project work. ",

        goal_description: "I am currently looking for a job that is in the web development industry. I am interested in Full-stack web development positions that use ReactJS, AWS, or GCP. I am confident that I can apply the skills I have developed and gained from my co-ops, school projects, and esports experience at my next job posting.",
        details_about_self: [
            "I really enjoy playing video games on PC",
            "I like playing board games or online games with friends",
            "I'm a collector of computer gaming mice and mechanical keyboards",
            "I love Japanese's pop culture with Anime, Manga, and Light Novels",
            "I enjoy watching and competing in Esports",
        ],
        interested_in: [
            "PC Builder Enthusiast",
            "Gaming Mouse Enthusiast",
            "Mechanical Keyboard Enthusiast",
            "PC Games",
            "Esports",
            "Competition",
            "FPS Games",
            "CSGO",
            "Crossfire",
            "Anime",
            "Manga",
            "Light Novels",
            "Minecraft",
            "Osu!",
            "World of Tanks",
            "Japanese Culture"
        ]
    }
    //await insertAboutMe(initData);
    await updateAboutMe(initData);
};

//if you want to change, you have to copy the data fields from mongodb collection for bucketFiles
async function initBucketFiles() {
    //resume
    await upsertBucketFile({
        bucket_file_signed_url: "https://private-personal-website-storage.s3.us-west-2.amazonaws.com/jordan_resume.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZHHBVYBNPTHPENT%2F20210623%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210623T024313Z&X-Amz-Expires=3600&X-Amz-Signature=efe49eebb68c9f218573a3143a451aded969a6d1346b5234b6b41629417bacaf&X-Amz-SignedHeaders=host",
        expire_at: "2021-06-23T03:43:13.738Z",
        bucket_key: "jordan_resume.pdf",
        cloud_front_url: "",
        is_private: true,
        file_id: nanoid()
    })
    //profile picture
    await upsertBucketFile({
        bucket_file_signed_url: "https://private-personal-website-storage.s3.us-west-2.amazonaws.com/jordan_profile_picture.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZHHBVYBNPTHPENT%2F20210623%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210623T024313Z&X-Amz-Expires=3600&X-Amz-Signature=6c414d312ceb5c46878179898e1f68936629e66dea13c858a2fccbb1a8203590&X-Amz-SignedHeaders=host",
        expire_at: "2021-06-23T03:43:13.743Z",
        cloud_front_url: "",
        bucket_key: "jordan_profile_picture.jpg",
        is_private: true,
        file_id: nanoid()
    })
}

module.exports = {
    initResumeDisplay,
    initJordanHo,
    initApps,
    initAdminSettings,
    initAboutMe,
    initBucketFiles,
}