# iasur

A very thin web and api based file upload and destribution service.

* Latest Release: [![GitHub version](https://badge.fury.io/gh/DracoBlue%2Fiasur.png)](https://github.com/DracoBlue/iasur/releases)
* Build-Status: [![Build Status](https://travis-ci.org/DracoBlue/iasur.png?branch=master)](https://travis-ci.org/DracoBlue/iasur)
* Official Site: http://dracoblue.net/

iasur is copyright 2014 by DracoBlue http://dracoblue.net

## Installation

Install from npm (global):

``` console
$ sudo npm install -g iasur
```

or local:

``` console
$ npm install iasur
```

You might fetch the latest version from git:

``` console
$ git clone https://github.com/DracoBlue/iasur.git iasur
$ cd iasur
$ npm install #to fetch dependencies
```

## Usage

Initialize the server directory with:

``` console
$ mkdir project
$ cd project
$ iasur create
Initializing folder for iasur:
 - folders: /home/you/project/folders/
 - files: /home/you/project/files/
Done!

Serve folder with: /usr/local/bin/iasur serve http://127.0.0.1:1337/
```

and thens serve the directory:

``` console
$ iasur serve http://127.0.0.1:1337/
Server running at http://127.0.0.1:1337/
```

## Enable theming

If you want to have a custom theme for your iasur server, run:

``` console
$ iasur enable-theming
Initializing ./views folder for iasur:
 - ./views/_footer.twig
 - ./views/_header.twig
 - ./views/files.twig
 - ./views/upload_files.twig
 - ./views/upload_zip.twig
Done!
```

Now you can modify the files at `./views/{_header.twig,_footer.twig}` to modify the header and footer.

That's it!

## Run tests

``` console
$ make test
Execute all Tests
- launched test server at http://127.0.0.1:32457 with pid 38995
Server running at http://127.0.0.1:32457/
- push 2 files (html)
- push zip file (html)
- push 2 files (json)
- push zip file (json)
- killed server at pid 38995
```

## Changelog

* 1.2.0 (2017/08/06)
  - normalize base url #2
* 1.1.0 (2014/03/23)
  - use local folder `./views` as local theme
  - made views, files and folders relative to `process.cwd()` #1
* 1.0.0 (2014/03/23)
  - added option to create a theme
  - initial release

## License

iasur is licensed under the terms of MIT.