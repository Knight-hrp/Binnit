const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const path = require('path');
const cookieParser = require('cookie-parser');

const setupSocket = require("./socketHandler"); 
setupSocket(server);

const {restrictToNonLoginUser} = require('./middleware/auth');

const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const userProfileRoute = require("./routes/userProfile");
const communityRoute = require('./routes/community');
const upVoteRoute = require('./routes/upVote')
const commentsRoute = require('./routes/comments');
const downVoteRoute = require('./routes/downVote');
const feedbackRoute = require('./routes/feedback')

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "css")));

app.use(express.json()); 
app.use(cookieParser()); 
app.use("/Uploads", express.static("Uploads"));
app.use("/communityImage", express.static(path.join(__dirname, 'communityImage')));
app.use('/favicon_io(2)', express.static(path.join(__dirname, 'Assets/favicon_io(2)')));
app.use('/image_scrolls', express.static(path.join(__dirname, 'Assets/image_scrolls')));
app.use("/svg_icons", express.static(path.join(__dirname, 'Assets/svg_icons')));

const USER = require('./models/user');
const PROFILEPICTURE = require('./models/userProfilePicture');
const COMMUNITY = require('./models/community')
const JOINCOMMUNITY = require('./models/joinCommunity');
const POST = require('./models/post');
const UPVOTE = require('./models/upVote');
const COMMENTS = require('./models/comments');
const COMMUNTIYROLE = require('./models/communityRole');
const DOWNVOTE = require('./models/downVote');
const COMMENTUPVOTE = require('./models/commentUpvote');
const FEEDBACK =  require('./models/feedback');

const {connectToMongoDB} = require("./connect")


app.set("view engine", "ejs");
app.set('views', path.join(__dirname, './views'));
const port  = 8000;

connectToMongoDB('mongodb://127.0.0.1:27017/communityForum');

app.use("/",staticRoute);
app.use("/user",userRoute);
app.use("/profile", restrictToNonLoginUser, userProfileRoute);
app.use("/community",restrictToNonLoginUser, communityRoute);
app.use("/upVote", restrictToNonLoginUser, upVoteRoute);
app.use("/comments", restrictToNonLoginUser, commentsRoute)
app.use("/downVote", restrictToNonLoginUser, downVoteRoute);
app.use("/feedback", restrictToNonLoginUser, feedbackRoute)


server.listen(8000,()=>{
    console.log(`WEB Application running on : http://localhost:${port} `);
});