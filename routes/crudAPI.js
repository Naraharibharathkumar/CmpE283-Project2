/**
 * Created by BharathKumar on 11/28/2016.
 */
var express = require('express');
var router = express.Router();
var exec = require('ssh-exec');

var hostinfo = {
    user: 'project',
    host: '192.168.86.129',
    password: '1234'
};

//API for Getting Container List
router.post('/getContainer', function(req, res, next) {
    var containerName = req.body.ContainerName;
    if(typeof(containerName) != 'undefined'  && containerName.length > 0) {
        try{
            var url = 'curl -XGET http://127.0.0.1:2375/images/search?term='+containerName;
            exec( url , hostinfo , function (er, stdout, stderr) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200);
                res.send(stdout);
            });
        }
        catch(err){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" : err.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Container Name"});
    }
});

//API For getting image list from Host
router.post('/listImages', function(req, res, next){
    try{
        var imageUrl = 'curl http://localhost:2375/images/json';
        exec( imageUrl, hostinfo ,function (err1, result1, temp) {
            if(result1==''){
                res.setHeader('Content-Type', 'application/json');
                res.status(450);
                res.send({"Status" : "Error", "ImageList" : []});
            }
            else{
                result1 = JSON.parse(result1);
                var resultJSON = [];
                var tempArr = [];
                var tempName = "";
                result1.forEach(function (result) {
                    tempName = result.RepoTags[0];
                    tempArr = tempName.split(":");
                    resultJSON.push({"ImageName" : tempArr[0],"ImageTag" : tempArr[1]});
                });
                res.setHeader('Content-Type', 'application/json');
                res.status(200);
                res.send({"Status" : "Ok", "ImageList" : resultJSON});
            }
        });
    }
    catch(ex){
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : ex.toString()});
    }
});

//API For getting Container List
router.post('/listContainers', function(req, res, next){
    try{
        var imageUrl = 'curl http://localhost:2375/containers/json?all=1';
        exec( imageUrl, hostinfo ,function (err1, result1, temp) {
            if(result1==''){
                res.setHeader('Content-Type', 'application/json');
                res.status(450);
                res.send({"Status" : "Error", "ContainerList" : []});
            }
            else{
                result1 = JSON.parse(result1);
                var resultJSON = [];
                result1.forEach(function (result) {
                    resultJSON.push({"Id" : result.Id,"Name" : result.Names[0].substring(1, result.Names[0].length), "Image" : result.Image, "Command" : result.Command, "Ports" : result.Ports, "Status" : result.State});
                });
                res.setHeader('Content-Type', 'application/json');
                res.status(200);
                res.send({"Status" : "Ok", "ContainerList" : resultJSON});
            }
        });
    }
    catch(ex){
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : ex.toString()});
    }
});

//API For Creating a New Image
router.post('/createImage', function (req, res, next) {
    var containerName = req.body.ContainerName;
    var containerTag = req.body.ContainerTag;
    if(typeof(containerName)!='undefined' && containerName.length > 0){
        try{
            var getUrl = 'curl http://localhost:2375/images/json';
            exec( getUrl , hostinfo , function (err1, result1, temp) {
                if(result1==''){
                    res.setHeader('Content-Type', 'application/json');
                    res.status(450);
                    res.send({"Status" : "Error", "Message" : "Connection Failed"});
                }
                else{
                    if(result1=='[]\n'){
                        var getImageUrl = 'curl -XPOST http://localhost:2375/images/create?fromImage='+containerName+':'+containerTag;
                        exec( getImageUrl , hostinfo , function (cmdErr, cmdout, remoteErr) {
                        });
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200);
                        res.send({"Status" : "Ok", "Message" : "Wait for a while when the container is created"});
                    }
                    else{
                        var nullException = {};
                        var breakException = [];
                        try{
                            result1 = JSON.parse(result1);
                            var index = 0;
                            result1.forEach(function(result){
                                var repoTag = result.RepoTags;
                                if(repoTag[0]==containerName+':'+containerTag){
                                    throw breakException;
                                }
                                index++;
                                if(index == result1.length){
                                    throw nullException;
                                }
                            });
                        }
                        catch(ee){
                            if(ee==breakException){
                                res.setHeader('Content-Type', 'application/json');
                                res.status(204);
                                res.send({"Message" : "Image already present on host"});
                            }
                            else if(ee==nullException){
                                var getImageUrl = 'curl -XPOST http://localhost:2375/images/create?fromImage='+containerName+':'+containerTag;
                                exec( getImageUrl , hostinfo , function (cmdErr, cmdout, remoteErr) {
                                });
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200);
                                res.send({"Status" : "Ok", "Message" : "Wait for a while when the container is created"});
                            }
                            else{
                                throw ee;
                            }
                        }
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
        res.send({"Message" : "Invalid Container Name"});
    }
});

//API For Creating a New Container
router.post('/createContainer', function(req, res, next) {
    var containerName = req.body.ContainerName;
    var containerTag = req.body.ContainerTag;
    if(typeof(containerName) != 'undefined'  && containerName.length > 0) {
        try{
            var url = 'curl -X POST -H "Content-Type: application/json" -d \'{"Hostname":"","User":"","Memory":0,"MemorySwap":0,"AttachStdin":false,"AttachStdout":true,"AttachStderr":true,"PortSpecs":null,"Privileged":false,"Tty":false,"OpenStdin":false,"StdinOnce":false,"Env":null,"Dns":null,"Image":"'+containerName+'","tag":"'+containerTag+'","Volumes":{},"WorkingDir":""}\' http://127.0.0.1:2375/containers/create';
            exec( url , hostinfo , function (error, stdout, stderr) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200);
                res.send(stdout);
            });
        }
        catch(ex) {
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" :ex.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Container Name"});
    }
});

//Start the Container
router.post('/startContainer', function(req, res, next){
    var containerId = req.body.ContainerId;
    if(typeof(containerId) != 'undefined'  && containerId.length > 0) {
        var url = 'curl -XPOST http://127.0.0.1:2375/containers/'+containerId+'/start';
        try{
            exec( url , hostinfo, function (err, stdout, stderr) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200);
                    res.send(stdout);
            });
        }
        catch(ex){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" :ex.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Container Name"});
    }
});

//Stop the Container
router.post('/stopContainer', function(req, res, next){
    var containerId = req.body.ContainerId;
    console.log(containerId)
    if(typeof(containerId) != 'undefined'  && containerId.length > 0) {
        var url = 'curl -XPOST http://127.0.0.1:2375/containers/'+containerId+'/stop';
        try{
            exec( url , hostinfo, function (err, stdout, stderr) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200);
                res.send(stdout.substring(0,stdout.length-1));
            });
        }
        catch(ex){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" :ex.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Container Name"});
    }
});

//Delete the Container
router.post('/removeContainer', function(req, res, next){
    var containerId = req.body.ContainerId;
    if(typeof(containerId) != 'undefined'  && containerId.length > 0) {
        var url = 'curl -X DELETE http://127.0.0.1:2375/containers/'+containerId;
        try{
            exec( url , hostinfo , function (err, stdout, stderr) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200);
                    res.send(stdout);
            });
        }
        catch(ex){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" :ex.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Container Name"});
    }
});

//API For getting CPU Stats
router.post('/getCpuStats', function (req, res, next) {
    var containerId = req.body.ContainerId;
    if(typeof(containerId) != 'undefined'  && containerId.length > 0) {
        try{
            var url = 'echo -e "GET /containers/'+containerId+'/stats?stream=0 HTTP/1.0\r\n" | nc -q -1 -U /var/run/docker.sock | tail -1'
            exec(url, hostinfo, function (er, stdout, stderr) {
                if(stdout==''){
                    res.setHeader('Content-Type', 'application/json');
                    res.status(450);
                    res.send({"CPU" : 0.0});
                }
                else {
                    stdout = stdout.substring(0, stdout.length -1);
                    if(stdout!=""){
                        stdout = JSON.parse(stdout);
                        var prevCPU = stdout.precpu_stats.cpu_usage.total_usage;
                        var prevSys = stdout.precpu_stats.system_cpu_usage;
                        var currCPU = stdout.cpu_stats.cpu_usage.total_usage;
                        var currSys = stdout.cpu_stats.system_cpu_usage;
                        prevCPU = prevCPU/1000000000;
                        prevSys = prevSys/1000000000;
                        currCPU = currCPU/1000000000;
                        currSys = currSys/1000000000;
                        var cpuDelta = currCPU - prevCPU;
                        var sysDelta = currSys - prevSys;
                        var cpuPerc = 0.0;
                        var temp = stdout.cpu_stats.cpu_usage.percpu_usage;
                        if(sysDelta > 0.0 && cpuDelta > 0.0){
                            cpuPerc = (cpuDelta/sysDelta)*(temp.length)*100.0;
                        }
                    }
                    else{
                        cpuPerc = 0.0;
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200);
                    res.send({"CPU" : parseFloat(cpuPerc)});
                }
            });
        }
        catch(err){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" : err.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Container Name"});
    }
});

//API For getting Memory Usage
router.post('/getMemoryStats', function (req, res, next) {
    var containerId = req.body.ContainerId;
    if(typeof(containerId) != 'undefined'  && containerId.length > 0) {
        try{
            var url = 'echo -e "GET /containers/'+containerId+'/stats?stream=0 HTTP/1.0\r\n" | nc -q -1 -U /var/run/docker.sock | tail -1'
            exec(url, hostinfo, function (er, stdout, stderr) {
                if(stdout==''){
                    res.setHeader('Content-Type', 'application/json');
                    res.status(450);
                    res.send({"Memory" : 0.0, "Limit" : 0.0});
                }
                else {
                    stdout = stdout.substring(0, stdout.length -1);
                    stdout = JSON.parse(stdout);
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200);
                    res.send({"Memory" : stdout.memory_stats.usage/1000000, "Limit" : stdout.memory_stats.limit/1000000});
                }
            });
        }
        catch(err){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" : err.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Container Name"});
    }
});

//API For Network Throughput
router.post('/getNetworkStats', function (req, res, next) {
    var containerId = req.body.ContainerId;
    if(typeof(containerId) != 'undefined'  && containerId.length > 0) {
        try{
            var url = 'echo -e "GET /containers/'+containerId+'/stats?stream=0 HTTP/1.0\r\n" | nc -q -1 -U /var/run/docker.sock | tail -1'
            exec(url, hostinfo, function (er, stdout, stderr) {
                    stdout = stdout.substring(0, stdout.length -1);
                    stdout = JSON.parse(stdout);
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200);
                    res.send({"Network" : stdout});
            });
        }
        catch(err){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" : err.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Container Name"});
    }
});

//API For I/O
router.post('/getIOStats', function (req, res, next) {
    var containerId = req.body.ContainerId;
    if(typeof(containerId) != 'undefined'  && containerId.length > 0) {
        try{
            var url = 'echo -e "GET /containers/'+containerId+'/stats?stream=0 HTTP/1.0\r\n" | nc -q -1 -U /var/run/docker.sock | tail -1'
            exec(url, hostinfo, function (er, stdout, stderr) {
                if(stdout==''){
                    res.setHeader('Content-Type', 'application/json');
                    res.status(450);
                    res.send({"IO" : {}});
                }
                else {
                    stdout = stdout.substring(0, stdout.length -1);
                    stdout = JSON.parse(stdout);
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200);
                    res.send({"IO" : stdout});
                }
            });
        }
        catch(err){
            res.setHeader('Content-Type', 'application/json');
            res.status(450);
            res.send({"Message" : err.toString()});
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.status(450);
        res.send({"Message" : "Invalid Container Name"});
    }
});

module.exports = router;
