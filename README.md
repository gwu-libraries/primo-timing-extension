### Primo Timing Extension for Firefox ###

The purpose of this simple Firefox extension is to collect data about the latency of elements in Primo VE. As currently configured, this extension times the roundtrip latency of requests for item availability, where Primo enhances its indexed information with live calls to one or more Alma IZ's. The extension listens for  "ILSServices" requests made by the Primo UI, logging request and response times to an external database. It also logs the body of the request (which includes information that can be used to identify the IZ to which the request was made), as well as limited information about the browser and OS. (Each browser instance is assigned a unique ID which is stored on the user's computer, allowing for consistency of tracking.)

The extension has been tested on Firefox 54.x and higher on PC's running Windows 7 and 10. 

**Requirements for External Database**
Python 3.x
Node.js 10.x
PostgreSQL 9.5 or greater

**Set Up and Installation**

1. Set up the server and database.
  a. Clone the repository.
  b. In the project directory, do `npm install` at the command line to install the Node dependencies.
  c. Optional: Use `virtualenv` to create a Python virtual environment.
  d. Do `pip install sqlalchemy, psycopg2` to install the Python dependencies.
  e. Create a PostgreSQL database for use with this project.
  f. Update `config.json` with the name of the database, its port number, and the user's credentials.
  g. Set up the database by running `python db_setup.py` at the command line.
  g. Make sure PostgreSQL is running as a service, and start the server by running `node server.js` or by using a process manager like **pm2** <http://pm2.keymetrics.io/>

2. Package, sign, and install the extension.
  a. Rename `background_.js` as `background.js`.
  b. Edit `background.js` to include the base URL to your Primo instance (stored in the `pattern` variable) and the URL where `server.js` is running (stored in the `remoteLogUrl` variable).
  c. Create a zip file that includes the `backgound` and `icons` folder and the file `manifest.json`.
  d. Follow the instructions to create a signed version of your extension, which can be installed by users using the Firefox Extensions menu: <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/Distribution/Submitting_an_add-on>.
  e. Distribute the `.xpi` version of the extension to your users. Users can install it by following the instructions at <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Distribution_options/Sideloading_add-ons>.
