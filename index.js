const { query } = require('express');
const express = require('express');
const axios = require('axios');
const queryString = require('query-string');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const port = 6979;
const JWT_SECRET = 'SNUXPLORE';
const COOKIE_NAME = 'auth_token';
const app = express();
app.use(cookieParser());
app.use(cors({
    origin:'http://localhost:6989',
    credentials:true,
}))
function getGoogleAuthURL() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: 'http://localhost:6979/auth/google',
        client_id: '276359144026-9u157plevbsa1rnde01fsdrepp4tt113.apps.googleusercontent.com',
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(" "),
    };
    return `${rootUrl}?${queryString.stringify(options)}`;
}
function getTokens(_a) {
    const code = _a.code, clientId = _a.clientId, clientSecret = _a.clientSecret, redirectUri = _a.redirectUri;
    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    };
    return axios.post(url, queryString.stringify(values), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    }).then((res) => res.data)
        .catch((error) => {
            console.error('FAILED TO FETCH ACCESS TOKEN');
        });
};

app.get('/auth/google', async (req, res) => {
    const code = String(req.query.code);
    const { id_token, access_token } = await getTokens({
        code: code,
        clientId: '276359144026-9u157plevbsa1rnde01fsdrepp4tt113.apps.googleusercontent.com',
        clientSecret: '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',
        redirectUri: 'http://localhost:6979/auth/google',
    });

    const googleUser = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,{
        headers:{
            Authorization: `Bearer ${id_token}`,
        },
    }).then((res) => res.data)
        .catch((error) => {
            console.log('FAILED TO FETCH USER');
        });
    
    const token = jwt.sign(googleUser , JWT_SECRET);
    res.cookie(COOKIE_NAME,token,{
        maxAge:900000,
        httpOnly:true,
        secure:false,
    });
    res.redirect('http://localhost:6979/auth/loggedIn');
})
app.get("/auth/loggedIn" , (req,res) => {
    try{
        const decoded = jwt.verify(req.cookies[COOKIE_NAME] , JWT_SECRET);
        console.log("decoded" , decoded);
        res.send(decoded);
    } catch (err) {
        console.log(err);
        res.send(null);
    }
})
app.get("/auth/google/url", (req, res) => {
    return res.send(getGoogleAuthURL());
})

app.listen(port, () => {
    console.log(`listening at ${port}`);
})