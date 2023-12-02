# tinyapp

# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["login page"](https://github.com/leslieyjkim/tinyapp/blob/main/docs/urls-page_login.png?raw=true)
!["create new URL page"](https://github.com/leslieyjkim/tinyapp/blob/main/docs/urls-page_new.png?raw=true)
!["register page"](https://github.com/leslieyjkim/tinyapp/blob/main/docs/urls-page_register.png?raw=true)
!["short URL create/edit page"](https://github.com/leslieyjkim/tinyapp/blob/main/docs/urls-page_shrotURL.png?raw=true)
!["my URL list page"](https://github.com/leslieyjkim/tinyapp/blob/main/docs/urls-page_urls.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

#

\*start with : ./node_modules/.bin/nodemon -L express_server.js

\*To find out which process is currently using port 8080:
lsof -i tcp:8080
kill -9 PID
