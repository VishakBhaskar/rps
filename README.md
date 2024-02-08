# How to run this project locally:
Get a wallet connect project id from [here](https://walletconnect.com/).
Clone the repo and move into the directory : 
```sh
git clone https://github.com/VishakBhaskar/rps
cd rps
```

```sh
cd rps-frontend
```

## Running the frontend app

Create .env.local file.

Create an environment variable and name it NEXT_PUBLIC_WEB3MODAL_ID and store the project id in the variable.

Install the dependencies and devDependencies:
```sh
npm install
```
Run the project
```sh
npm run dev
```
## Running the backend server:
```sh
cd api
```
```sh
npm install
```

Create a .env file.
create an environment variable named DATABASE_URL and store your MongoDB URL in it which looks something like:
```sh
mongodb+srv://<pw>@test.caflgyz.mongodb.net/
```
Start the server:
```sh
npm start
```

The server starts in port 8000 
