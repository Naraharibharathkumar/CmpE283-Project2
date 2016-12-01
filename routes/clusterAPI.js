/**
 * Created by BharathKumar on 11/30/2016.
 */
var express = require('express');
var router = express.Router();
var exec = require('ssh-exec');

//API For Creating Cluster
router.post('/createCluster', function(req, res, next){
    var containerId = req.body.ContainerId;
    if(typeof(containerId) != 'undefined'  && containerId.length > 0) {
        var url = 'curl -X DELETE http://127.0.0.1:2375/containers/'+containerId;
        url = 'ls';
        exec( url , {
            user: 'project',
            host: '192.168.86.129',
            password: '1234'
        }, function (err, stdout, stderr) {
            console.log(stdout);
            //res.setHeader('Content-Type', 'application/json');
            //res.send(stdout);
            res.write(stdout);
            res.end();
        });
    }
    else{
        console.log("Hello");
        res.setHeader('Content-Type', 'application/json');
        res.send({"status" : "Failure", "message" : "Incorrect String"});
    }
});

module.exports = router;