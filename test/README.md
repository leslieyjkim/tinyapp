## how to run this test
at terminal/at the test directory, <br><br>
npx mocha <test_file_name>.js <br><br>
example: .../lighthouse/tinyapp/test/httpTest.js
<br><br>
*if you want to run specific test case,* try this
<br><br>
npx mocha <test_file>.js --grap "\<specific statement in the describe part>"
<br><br><br><br>

## how can I generate test script by using chatGPT
testcase: GET /urls/:id, a user should see an error message if they do not own the URL
- "Considering that I'm using mocha, chai and chai-http, and a session cookie to store the user idss, write a test using the expect syntax with promises for the following case and the agent pattern with promises for the following case:
I expect that a successful login using the POST request to "http://localhost:8080/login" with the credentials' form with test@test.com as username and test as the password, followed by a GET request done on "http://localhost:8080/urls/b2xVn2" will be met with a status code of 403."

testcase: GET /, a user should be redirected to /login if they are not logged in
- "Considering that I'm using mocha, chai and chai-http, and a session cookie to store the user idss, write a test using the expect syntax with promises for the following case and the agent pattern with promises for the following case:
I expect that a successful redirction to "http://localhost:8080/login" after the GET request to "http://localhost:8080/" if login was not conducted"

testcase: GET /urls/new, a user should be redirected to /login if they are not logged in
- "Considering that I'm using mocha, chai and chai-http, and a session cookie to store the user idss, write a test using the expect syntax with promises for the following case and the agent pattern with promises for the following case:
I expect that a successful redirction to "http://localhost:8080/login" after the GET request to "http://localhost:8080/urls/new" if login was not conducted"

testcase: GET /urls/:id, a user should see an error message if they are not logged in
- "Considering that I'm using mocha, chai and chai-http, and a session cookie to store the user idss, write a test using the expect syntax with promises for the following case and the agent pattern with promises for the following case:
I expect that a successful redirction to "http://localhost:8080/login" after the GET request to "http://localhost:8080/urls/_test_" if login was not conducted"

testcase: GET /u/:id, a user should see an error message if the URL doesn't exist
- "Considering that I'm using mocha, chai and chai-http, and a session cookie to store the user idss, write a test using the expect syntax with promises for the following case and the agent pattern with promises for the following case:
I expect that a successful login using the POST request to "http://localhost:8080/login" with the credentials' form with test@test.com as username and test as the password, followed by a GET request done on "http://localhost:8080/u/youdonothave" will be met with a status code of 404."