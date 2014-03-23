# iasur

A very thin web and api based file upload and destribution service.

* Latest Release: [![GitHub version](https://badge.fury.io/gh/DracoBlue%2Fiasur.png)](https://github.com/DracoBlue/iasur/releases)
* Build-Status: [![Build Status](https://travis-ci.org/DracoBlue/iasur.png?branch=master)](https://travis-ci.org/DracoBlue/iasur)
* Official Site: http://dracoblue.net/

iasur is copyright 2014 by DracoBlue http://dracoblue.net

## Installation

Installation will be available via npm. So long use the latest version from git.

``` console
$ git clone https://github.com/DracoBlue/iasur.git iasur
$ cd iasur
$ npm install
```

## Usage

Run the server with:

``` console
$ ./iasur_server.js http://127.0.0.1:1337/
Server running at http://127.0.0.1:1337/
```

## Custom Name / Footer

Modify `views/themes/default/{_header.twig,_footer.twig}` or create your own theme.

## Custom Theme

If you want to use/make a custom theme, copy the folder `views/themes/default` to `views/themes/mytheme`.

Modify the files.

Configure to run your theme, by adding a `config.json` to the iasur folder:

```
{
  "theme": "mytheme"
}
```

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

* dev
  - made views, files and folders relative to `process.cwd()`
* 1.0.0 (2014/03/23)
  - added option to create a theme
  - initial release

## License

iasur is licensed under the terms of MIT.