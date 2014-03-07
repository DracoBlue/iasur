#!/usr/bin/env node
var AdmZip = require('adm-zip');
var express = require('express');
var uuid = require('node-uuid');
var fs = require("fs");
var path = require("path");
var url = require("url");
var formidable = require('formidable');
var twig = require("twig");

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
var base_index_files_folder = __dirname + '/files/';
var base_index_files_url = base_url + 'files/';

app.set('view engine', 'twig');

app.set("twig options", {
    strict_variables: false
});


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
    var content_type = req.accepts(['html', 'json']);

    if (content_type == 'json')
    {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({"http://dracoblue.net/iasur/rels/zip-files": base_url + '/zip-files', "http://dracoblue.net/iasur/rels/files": base_url + '/files'}));
    }
    else
    {
        res.setHeader('Location', '/upload/zip');
        res.statusCode = 301;
        res.end();
    }
});

app.get('/upload/zip', function (req, res)
{
    var content_type = req.accepts(['html', 'json']);

    res.render('upload_zip', { "title": "Choose your file", "_title": "Upload one .zip / iasur", "_tab": "zip" });
});

app.get('/upload/files', function (req, res)
{
    var content_type = req.accepts(['html', 'json']);

    res.render('upload_files', { "title": "Choose your files", "_title": "Upload files / iasur", "_tab": "files" });
});

var createIndexFileAndRedirect = function(folder_id, options, req, res)
{
    fs.writeFile(base_index_files_folder + '/' + folder_id + '.json', JSON.stringify(options), function (err) {
        /* FIXME: handle err */

        var content_type = req.accepts(['html', 'json']);

        if (content_type == 'json')
        {
            res.statusCode = 201;
        }
        else
        {
            res.statusCode = 301;
        }

        res.setHeader('Location', base_index_files_url + folder_id);
        res.end();
    });
};

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
    var entries = zip.getEntries();

    if (!entries.length)
    {
        res.setHeader('Content-Type', 'text/plain');
        res.send('The zip file is empty');
        return;
    }

    var file_names = [];

    entries.forEach(function(entry)
    {
       file_names.push(entry.name);
    });

    var folder_id = uuid.v4();

    zip.extractAllTo(base_folders_folder + folder_id, true);

    createIndexFileAndRedirect(folder_id, {"entries": file_names}, req, res);
});

app.get('/files/:id', function(req, res)
{
    fs.readFile(base_index_files_folder + '/' + req.params.id + '.json', function (err, data) {
        /* FIXME: handle err */
        data = JSON.parse(data.toString());
        res.send('file: ' + req.params.id + ' data: ' + JSON.stringify(data));
        res.end();
    });
})

app.post('/files', function (req, res)
{
    var raw_files = req.files;

    var folder_id = uuid.v4();

    var files = [];
    var file_names = [];

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
        file_names.push(path.basename(file.name));
        fs.createReadStream(file.path).pipe(fs.createWriteStream(base_folders_folder + folder_id + '/' + path.basename(file.name)));
    });

    createIndexFileAndRedirect(folder_id, {"entries": file_names}, req, res);
});

app.use('/folders', express.static(base_folders_folder));
app.use('/static', express.static(__dirname + '/static'));

var url_parts = url.parse(base_url);

app.listen(url_parts['port'] || 80, url_parts['hostname']);
console.log('Server running at ' + base_url);
