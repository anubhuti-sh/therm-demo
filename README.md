# Geo Info API
---
#### _Gets area, centroid, and center of mass of a given area segment_

### deployed URL
[geo]

### Specification
Geo Info API lets you to see the information of segments present in a area this information involves coordinates, area, centroid and center of mass -
1. Authentication
2. Area list.
3. Segment list
4. Segments area info with sorting
5. Segments centroid info with sorting based indistance in longitude

### Postman API collection
[API collection](https://www.getpostman.com/collections/1673a43f147c823cd41f)
baseUrl - 

### Running Project locally

Follow these steps in order to set up this project in your local system
1. Clone this repo via command `git clone https://github.com/anu-007/geoarea.git`.
2. Move into the directory.
3. run `npm i` to install all the dependency.
4. run `npm start` to start the server.
5. API is live on `http://localhost:3000`.

### API end points
1. /login
use	"username": "john" and "password": "qwerty123" to login and get jwt token

2. /allareas
to get list of all areas

3. /segments/:uid?q=<query>&sort=<asc|desc>
to get segment information
valid values of q = area, centroid, centerOfMass
valid values of sort = asc, desc