#!/usr/bin/env node
var AdmZip = require('adm-zip');
var express = require('express');
var uuid = require('node-uuid');
var fs = require("fs");
var path = require("path");
var url = require("url");
var formidable = require('formidable');

var app = express();

if (process.argv.length < 3)
{
    console.error('Correct usage: ' + process.argv[0] + ' ' + process.argv[1] + ' http://127.0.0.1:1337/');
    process.exit(1);
    return ;
}

var base_url = process.argv[2];
var base_folders_folder = __dirname + '/folders/';
var base_folders_url = base_url + 'folders/';

app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', 'iasur');
    next();
});

app.use(function (req, res, next) {
    var form = new formidable.IncomingForm();

    if (req.method.toUpperCase() == 'POST')
    {
        form.parse(req, function (err, fields, files)
        {
            req.files = files;
            next();
        });
    }
    else
    {
        next();
    }
});

app.get('/', function (req, res)
{
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({"http://dracoblue.net/iasur/rels/zip-files": base_url + '/zip-files', "http://dracoblue.net/iasur/rels/files": base_url + '/files'}));
});

app.post('/zip-files', function (req, res)
{
    var raw_files = req.files;

    if (!raw_files || !raw_files.file)
    {
        res.setHeader('Content-Type', 'text/plain');
        res.send('file parameter missing');
        return;
    }

    var zip = new AdmZip(raw_files.file.path);

    if (!zip.getEntries().length)
    {
        res.setHeader('Content-Type', 'text/plain');
        res.send('The zip file is empty');
        return;
    }

    var folder_id = uuid.v4();

    zip.extractAllTo(base_folders_folder + folder_id, true);

    res.statusCode = 201;
    res.setHeader('Location', base_folders_url + folder_id);
    res.end();
});

app.post('/files', function (req, res)
{
    var raw_files = req.files;

    var folder_id = uuid.v4();

    var files = [];

    for (var file_name in raw_files) {
        if (raw_files.hasOwnProperty(file_name)) {
            files.push(raw_files[file_name]);
        }
    }

    if (!files.length) {
        res.setHeader('Content-Type', 'text/plain');
        res.send('No file given!');
        return;
    }

    fs.mkdirSync(base_folders_folder + folder_id);

    files.forEach(function (file)
    {
        fs.createReadStream(file.path).pipe(fs.createWriteStream(base_folders_folder + folder_id + '/' + path.basename(file.name)));
    });

    res.statusCode = 201;
    res.setHeader('Location', base_folders_url + folder_id);
    res.end();
});

app.use('/folders', express.static(base_folders_folder));

var url_parts = url.parse(base_url);

app.listen(url_parts['port'] || 80, url_parts['hostname']);
console.log('Server running at ' + base_url);
