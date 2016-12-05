/**
 * Created by BharathKumar on 11/30/2016.
 */
var express = require('express');
var router = express.Router();
var exec = require('ssh-exec');

var hostinfo = {
    user: 'project',
    host: '192.168.86.129',
    password: '1234'
};

//API For getting Image List for Cluster
router.post('/listImages', function(req, res, next){
    try{
        var url = 'cat decking.json';
        exec(url, hostinfo, function (err, stdout, stderr) {
            if(stdout==''){
                res.setHeader('Content-Type', 'application/json');
                res.status(450);
                res.send({"ImageList" : {}});
            }
            else {
                stdout = JSON.parse(stdout);
                var imageList = Object.keys(stdout.images);
                var resultJSON = [];
                var index = 0;
                imageList.forEach(function(image){
                    resultJSON.push({"Name" : image});
                    index = index + 1;
                    if(index==imageList.length){
                        console.log(resultJSON)
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200);
                        res.send({"ImageList" : resultJSON});
                    }
                });
            }
        });
    }
    catch(ex){
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : ex.toString()});
    }
});


//API For getting Cluster List
router.post('/getClusters', function (req, res, next) {
    try{
        var url = 'cat decking.json';
        exec(url, hostinfo, function (err, stdout, stderr) {
            if(stdout==''){
                res.setHeader('Content-Type', 'application/json');
                res.status(450);
                res.send({"ClusterList" : {}});
            }
            else {
                stdout = JSON.parse(stdout);
                var clusterList = Object.keys(stdout.clusters);
                var resultJSON = [];
                var index = 0;
                clusterList.forEach(function (cluster) {
                    var tempURL = 'decking status '+cluster;
                    exec(tempURL, hostinfo, function (err1, stdout1, stderr1) {
                        var state = '';
                        if(stdout1.indexOf('stopped') > -1){
                            state = 'stopped';
                        }
                        else if(stdout1.indexOf('does not exist') > -1){
                            state = 'stopped';
                        }
                        else{
                            state = 'running';
                        }
                        resultJSON.push({"ClusterName" : cluster, "ContainerList" : stdout.clusters[cluster], "State" : state});
                        index = index + 1;
                        if(index==clusterList.length){
                            res.setHeader('Content-Type', 'application/json');
                            res.status(200);
                            res.send({"ClusterList" : resultJSON});
                        }
                    });

                });
            }
        });
    }
    catch(ex){
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : ex.toString()});
    }
});


//API For Creating Cluster
router.post('/createCluster', function(req, res, next){
    var clusterName = req.body.ClusterName;
    var containerList = req.body.ContainerList;
    if(typeof(clusterName) != 'undefined'  && clusterName.length > 0) {
        try{
            var url = 'cat decking.json';
            exec(url, hostinfo, function (err, stdout, stderr) {
                try{
                    if(stdout==''){
                        res.setHeader('Content-Type', 'application/json');
                        res.status(450);
                        res.send({"Message" : ""});
                    }
                    else {
                        stdout = JSON.parse(stdout);
                        if(err!=null){
                            var clusterList = Object.keys(stdout.clusters);
                            var nullException = [];
                            var breakException = {};
                            if(clusterList.length==0){
                                throw nullException;
                            }
                            else{
                                clusterList.forEach(function (cluster) {
                                    if(cluster==clusterName){
                                        throw breakException;
                                    }
                                });
                                throw nullException;
                            }
                        }
                        else{
                            throw err;
                        }
                    }
                }
                catch(exe){
                    if(exe==nullException){
                        var containersList = Object.keys(stdout.containers);
                        var xy = [];
                        containerList.forEach(function (container) {
                            var value = container.Count;
                            for(var i = 1; i<=value; i++){
                                (function(i) {
                                    var tempName = container.Name + i;
                                    if(containersList.indexOf(tempName) > -1){

                                    }
                                    else{
                                        stdout.containers[tempName] = {"image":container.Image};
                                    }
                                    xy.push(tempName);
                                })(i);
                            }
                        });
                        stdout.clusters[clusterName] = xy;
                        var execUrl = 'echo \''+JSON.stringify(stdout)+'\' > decking.json';
                        exec(execUrl, hostinfo, function(err3, stdout3, stderr3){
                            var finalUrl = 'decking create '+clusterName;
                            exec(execUrl, hostinfo, function(err4, stdout4, stderr4){
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200);
                                res.send({"Message" : "Cluster Created"});
                            });
                        });
                    }
                    else if(exe==breakException){
                        res.setHeader('Content-Type', 'application/json');
                        res.status(450);
                        res.send({"Message" : "Cluster Name Already Taken"});
                    }
                    else{
                        throw exe;
                    }
                }
            });
        }
        catch(ex){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" : ex.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Cluster Name"});
    }
});

//API For starting a Cluster
router.post('/startCluster', function (req, res, next) {
    var clusterName = req.body.ClusterName;
    console.log(clusterName);
    if(typeof(clusterName) != 'undefined'  && clusterName.length > 0) {
        try{
            var url = 'cat decking.json';
            exec(url, hostinfo, function (err, stdout, stderr) {
                if(stdout==''){
                    res.setHeader('Content-Type', 'application/json');
                    res.status(450);
                    res.send({"Message" : ""});
                }
                else {
                    stdout = JSON.parse(stdout);
                    var clusterList = Object.keys(stdout.clusters);
                    if(clusterList.length==0){
                        res.setHeader('Content-Type', 'application/json');
                        res.status(450);
                        res.send({"Message" : "No Clusters with given name found"});
                    }
                    else{
                        var breakException = {};
                        var nullException = [];
                        try{
                            clusterList.forEach(function (cluster) {
                                if(cluster==clusterName){
                                    throw breakException;
                                }
                            });
                            throw nullException;
                        }
                        catch(ex){
                            if(ex==breakException){
                                var execUrl ='decking start '+clusterName;
                                console.log(execUrl)
                                exec(execUrl, hostinfo, function(err1, stdout1, stderr1){
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200);
                                    res.send({"Message" : "Cluster Started"});
                                });
                            }
                            else if(ex==nullException){
                                res.setHeader('Content-Type', 'application/json');
                                res.status(450);
                                res.send({"Message" : "No Clusters with given name found"});
                            }
                            else{
                                throw ex;
                            }
                        }

                    }
                }
            });
        }
        catch(exe){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" : exe.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Cluster Name"});
    }
});

//API For stopping a Cluster
router.post('/stopCluster', function (req, res, next) {
    var clusterName = req.body.ClusterName;
    if(typeof(clusterName) != 'undefined'  && clusterName.length > 0) {
        try{
            var url = 'cat decking.json';
            exec(url, hostinfo, function (err, stdout, stderr) {
                if(stdout==''){
                    res.setHeader('Content-Type', 'application/json');
                    res.status(450);
                    res.send({"Message" : ""});
                }
                else {
                    stdout = JSON.parse(stdout);
                    var clusterList = Object.keys(stdout.clusters);
                    if(clusterList.length==0){
                        res.setHeader('Content-Type', 'application/json');
                        res.status(450);
                        res.send({"Message" : "No Clusters with given name found"});
                    }
                    else{
                        var breakException = {};
                        var nullException = [];
                        try{
                            clusterList.forEach(function (cluster) {
                                if(cluster==clusterName){
                                    throw breakException;
                                }
                            });
                            throw nullException;
                        }
                        catch(ex){
                            if(ex==breakException){
                                var execUrl ='decking stop '+clusterName;
                                exec(execUrl, hostinfo, function(err1, stdout1, stderr1){
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200);
                                    res.send({"Message" : "Cluster Stopped"});
                                });
                            }
                            else if(ex==nullException){
                                res.setHeader('Content-Type', 'application/json');
                                res.status(450);
                                res.send({"Message" : "No Clusters with given name found"});
                            }
                            else{
                                throw ex;
                            }
                        }

                    }
                }
            });
        }
        catch(exe){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" : exe.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Cluster Name"});
    }
});

//API For Restarting a Cluster
router.post('/restartCluster', function (req, res, next) {
    var clusterName = req.body.ClusterName;
    if(typeof(clusterName) != 'undefined'  && clusterName.length > 0) {
        try{
            var url = 'cat decking.json';
            exec(url, hostinfo, function (err, stdout, stderr) {
                if(stdout==''){
                    res.setHeader('Content-Type', 'application/json');
                    res.status(450);
                    res.send({"Message" : ""});
                }
                else {
                    stdout = JSON.parse(stdout);
                    var clusterList = Object.keys(stdout.clusters);
                    if(clusterList.length==0){
                        res.setHeader('Content-Type', 'application/json');
                        res.status(450);
                        res.send({"Message" : "No Clusters with given name found"});
                    }
                    else{
                        var breakException = {};
                        var nullException = [];
                        try{
                            clusterList.forEach(function (cluster) {
                                if(cluster==clusterName){
                                    throw breakException;
                                }
                            });
                            throw nullException;
                        }
                        catch(ex){
                            if(ex==breakException){
                                var execUrl ='decking restart '+clusterName;
                                exec(execUrl, hostinfo, function(err1, stdout1, stderr1){
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200);
                                    res.send({"Message" : "Cluster Restarted"});
                                });
                            }
                            else if(ex==nullException){
                                res.setHeader('Content-Type', 'application/json');
                                res.status(450);
                                res.send({"Message" : "No Clusters with given name found"});
                            }
                            else{
                                throw ex;
                            }
                        }

                    }
                }
            });
        }
        catch(exe){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" : exe.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Cluster Name"});
    }
});

//API For Deleting a Cluster
router.post('/deleteCluster', function (req,res,next) {
    var clusterName = req.body.ClusterName;
    if(typeof(clusterName) != 'undefined'  && clusterName.length > 0) {
        try{
            var url = 'cat decking.json';
            exec(url, hostinfo, function (err, stdout, stderr) {
                if(stdout==''){
                    res.setHeader('Content-Type', 'application/json');
                    res.status(450);
                    res.send({"Message" : ""});
                }
                else {
                    stdout = JSON.parse(stdout);
                    var clusterList = Object.keys(stdout.clusters);
                    if(clusterList.length==0){
                        res.setHeader('Content-Type', 'application/json');
                        res.status(450);
                        res.send({"Message" : "No Clusters with given name found"});
                    }
                    else{
                        var breakException = {};
                        var nullException = [];
                        try{
                            clusterList.forEach(function (cluster) {
                                if(cluster==clusterName){
                                    throw breakException;
                                }
                            });
                            throw nullException;
                        }
                        catch(ex){
                            if(ex==breakException){
                                var containerList = stdout.clusters[clusterName];
                                containerList.forEach(function (container) {
                                    var execUrl = 'docker ps -aqf "name='+container+'"';
                                    exec(execUrl, hostinfo, function(err1, stdout1, stderr1){
                                        var url = 'curl -X DELETE http://127.0.0.1:2375/containers/'+stdout1.substring(0,stdout1.length-1);
                                        exec( url , hostinfo , function (err2, stdout2, stderr2) {
                                        });
                                    });
                                });
                                delete stdout.clusters[clusterName];
                                var execUrl = 'echo \''+JSON.stringify(stdout)+'\' > decking.json';
                                exec(execUrl, hostinfo, function(err3, stdout3, stderr3){

                                });
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200);
                                res.send({"Message" : "Cluster Deleted"});
                            }
                            else if(ex==nullException){
                                res.setHeader('Content-Type', 'application/json');
                                res.status(450);
                                res.send({"Message" : "No Clusters with given name found"});
                            }
                            else{
                                throw ex;
                            }
                        }

                    }
                }
            });
        }
        catch(exe){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" : exe.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Cluster Name"});
    }
});


module.exports = router;