const express = require('express');
const mongoose  = require('mongoose');


async function connectToMongoDB(url){
    return mongoose.connect(url).then(()=>{
        console.log("MongoDB connected");
    })
    .catch(()=>{
        console.log("failed to connect");
    })
}

module.exports = {
    connectToMongoDB
}