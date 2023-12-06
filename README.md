# tinyapp

# clone this repo to your local first.

how to clone for novice git users:

1. go to this repo: https://github.com/leslieyjkim/tinyapp

- To clone the repository using HTTPS, under "HTTPS", click .
- To clone the repository using an SSH key, including a certificate issued by your organization's SSH certificate authority, click SSH, then click .
- To clone a repository using GitHub CLI, click GitHub CLI, then click .

2. git clone:

- at your local terminal, type this: git clone https://github.com/leslieyjkim/tinyapp

# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

- login page
  !["login page"](https://github.com/leslieyjkim/tinyapp/blob/main/docs/urls-page_login.png?raw=true)
- create new tiny url based on the entered long url
  !["create new URL page"](https://github.com/leslieyjkim/tinyapp/blob/main/docs/urls-page_new.png?raw=true)
- register user login info (id, password)
  !["register page"](https://github.com/leslieyjkim/tinyapp/blob/main/docs/urls-page_register.png?raw=true)
- Edit existing tiny url with new long url
  !["short URL create/edit page"](https://github.com/leslieyjkim/tinyapp/blob/main/docs/urls-page_shrotURL.png?raw=true)
- show your all tiny urls
  !["my URL list page"](https://github.com/leslieyjkim/tinyapp/blob/main/docs/urls-page_urls.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm start` command, package.json has
  scripts/start with "./node_modules/.bin/nodemon -L express_server.js"

#

\*start with : ./node_modules/.bin/nodemon -L express_server.js

\*To find out which process is currently using port 8080:
lsof -i tcp:8080
kill -9 PID
