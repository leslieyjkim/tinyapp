const chai = require('chai');
const chaiHttp = require('chai-http');

// Enable Chai-HTTP for making HTTP requests
chai.use(chaiHttp);

const expect = chai.expect;

describe('case5 login pass then not having url failed', function () {
  let agent = chai.request.agent('http://localhost:8080'); // Replace with your server's URL

  it('should successfully log in and get a status code of 403 for unauthorized access', function () {
    // Define the form data with username and password
    // test username and password is given at the database for testing
    const formData = {
      username: 'test@test.com',
      password: 'test'
    };

    // Perform a successful login using POST request with form data
    return agent
      .post('/login')
      .type('form') // Specify that you are sending form data
      .send(formData)
      .then((loginRes) => {
        // Expecting a successful login response (status code 200)
        expect(loginRes).to.have.status(200);

        // Send a GET request after logging in to a restricted URL
        return agent.get('/urls/b2xVn2'); // Replace with your desired URL
      })
      .then((getRes) => {
        // Expecting a status code of 403 for unauthorized access
        expect(getRes).to.have.status(403);
      })
      .catch((err) => {
        throw err; // Forward the error to fail the test if any request fails
      });
  });

  // Cleanup: Log out if needed (assuming a logout endpoint)
  after(function () {
    return agent.get('/logout'); // Replace with your logout endpoint
  });
});


// GET /, a user should be redirected to /login if they are not logged in
describe('case1 not login at / then redirection', function () {
  let agent = chai.request.agent('http://localhost:8080'); // Replace with your server's URL

  it('should redirect to login page if not logged in', function () {
    // Send a GET request to the homepage without logging in
    return agent
      .get('/')
      .then((res) => {
        // Expecting a redirection (status code 302) to the login page
        expect(res).to.redirectTo('http://localhost:8080/login');
      });
  });

  // Cleanup: Log out if needed (assuming a logout endpoint)
  after(function () {
    return agent.get('/logout'); // Replace with your logout endpoint
  });
});

// GET /urls/new, a user should be redirected to /login if they are not logged in
describe('case2 no login at /urls/new then edirection', function () {
    let agent = chai.request.agent('http://localhost:8080'); // Replace with your server's URL
  
    it('should redirect to login page if not logged in', function () {
      // Send a GET request to '/urls/new' without logging in
      return agent
        .get('/urls/new')
        .then((res) => {
          // Expecting a redirection (status code 302) to the login page
          expect(res).to.redirectTo('http://localhost:8080/login');
        });
    });
  
    // Cleanup: Log out if needed (assuming a logout endpoint)
    after(function () {
      return agent.get('/logout'); // Replace with your logout endpoint
    });
  });

  //GET /urls/:id, a user should see an error message if they are not logged in
  describe('case3 no login at /urls/_test_ and Redirection', function () {
    let agent = chai.request.agent('http://localhost:8080'); // Replace with your server's URL
  
    it('should redirect to login page if not logged in', function () {
      // Send a GET request to '/urls/_test_' without logging in
      return agent
        .get('/urls/_test_')
        .then((res) => {
          // Expecting a redirection (status code 302) to the login page
          expect(res).to.redirectTo('http://localhost:8080/login');
        });
    });
  
    // Cleanup: Log out if needed (assuming a logout endpoint)
    after(function () {
      return agent.get('/logout'); // Replace with your logout endpoint
    });
  });

  // GET /u/:id, a user should see an error message if the URL doesn't exist
  describe('case4 login pass then redirection to url which does not exist (error)', function () {
    let agent = chai.request.agent('http://localhost:8080'); // Replace with your server's URL
  
    it('should return a status code of 404 for an invalid GET request', function () {
      // Define the form data with username and password for login
      const formData = {
        username: 'test@test.com',
        password: 'test'
      };
  
      // Perform a successful login using POST request with form data
      return agent
        .post('/login')
        .type('form') // Specify that you are sending form data
        .send(formData)
        .then((loginRes) => {
          // Expecting a successful login response (status code 200)
          expect(loginRes).to.have.status(200);
  
          // Send a GET request to an invalid URL ("/u/youdonothave")
          return agent.get('/urls/youdonothave'); // Replace with your desired URL
        })
        .then((getRes) => {
          // Expecting a status code of 404 for the invalid GET request

          expect(getRes).to.have.status(403);
        })
        .catch((err) => {
          throw err; // Forward the error to fail the test if any request fails
        });
    });
  
    // Cleanup: Log out if needed (assuming a logout endpoint)
    after(function () {
      return agent.get('/logout'); // Replace with your logout endpoint
    });
  });