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
        var all_files = {};

        form.addListener('file', function(file_name, file) {
            if (typeof all_files[file_name] === "undefined")
            {
                all_files[file_name] = [];
            }

            all_files[file_name].push(file);
        });

        form.parse(req, function (err, fields, files)
        {
            req.files = all_files;
            req.fields = fields;
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

    var zip = new AdmZip(raw_files.file[0].path);
    var zip_entries = zip.getEntries();

    if (!zip_entries.length)
    {
        res.setHeader('Content-Type', 'text/plain');
        res.send('The zip file is empty');
        return;
    }

    var entries = [];

    zip_entries.forEach(function(entry)
    {
       entries.push({"name": entry.name, "size": entry.header.size});
    });

    var folder_id = uuid.v4();

    zip.extractAllTo(base_folders_folder + folder_id, true);

    createIndexFileAndRedirect(folder_id, {"entries": entries, "title": req.fields.title, "description": req.fields.description}, req, res);
});

app.get('/files/:id', function(req, res)
{
    fs.readFile(base_index_files_folder + '/' + req.params.id + '.json', function (err, data) {
        /* FIXME: handle err */
        data = JSON.parse(data.toString());
        res.render('files', { "folder_base_url": base_folders_url + req.params.id + '/', "title": data.title, "description": data.description, "entries": data.entries, "_title": "Upload one .zip / iasur", "_tab": "zip" });
    });
})

app.post('/files', function (req, res)
{
    var files = [];

    for (key in req.files)
    {
        if (req.files.hasOwnProperty(key))
        {
            req.files[key].forEach(function(sub_file) {
                files.push(sub_file);
            });
        }
    }

    if (!files.length) {
        res.setHeader('Content-Type', 'text/plain');
        res.send('No file given!');
        return;
    }

    var folder_id = uuid.v4();
    var entries = [];

    fs.mkdirSync(base_folders_folder + folder_id);

    files.forEach(function (file)
    {
        entries.push({"name": path.basename(file.name), "size": file.size});
        fs.createReadStream(file.path).pipe(fs.createWriteStream(base_folders_folder + folder_id + '/' + path.basename(file.name)));
    });

    createIndexFileAndRedirect(folder_id, {"entries": entries, "title": req.fields.title, "description": req.fields.description}, req, res);
});

app.use('/folders', express.static(base_folders_folder));
app.use('/static', express.static(__dirname + '/static'));

var url_parts = url.parse(base_url);

app.listen(url_parts['port'] || 80, url_parts['hostname']);
console.log('Server running at ' + base_url);
