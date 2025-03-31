# mqtt-websocket-example - a message publisher and consumer, with a websocket connection to a React frontend

## Overview

This project simulates a scenario where many sensor devices send status updates to a server. A web browser can be used
to view the device locations on a map. The devices shown on the map will receive real-time updates.

The backend consists of a MQTT producer communicating with a consumer, which in turn communicates with connected
frontend React clients via WebSocket connections. It should be possible for hundreds of frontend clients to be
connected to the backend consumer - if more than this were required then a horizontal scaling solution could be
implemented with Nginx as the load balancer and Kubernetes/Docker containers running the backend Node.js processes.

The backend components are written in JavaScript running in a Node.js environment. The frontend is a React application.

A public MQTT test server mqtt://test.mosquitto.org is used for this demonstration. In a real life scenario a privately
owned server would be used instead. By using the public Mosquitto test server it is technically possible for other
producers to publish to the topic used in this example project, but as at the point of publishing this project the risk
of that happening is fairly low.

Multiple browsers and tabs can connect at the same time and all will receive device data updates via their WebSocket
connections to the MQTT consumer backend process. Note that maintaining the state of the Start/Stop Simulator buttons
between browser windows/tabs is beyond the scope of this project.

### Example screenshots

![Example UI](images/example-frontend-ui.png?raw=true)
![Example browser console](images/example-frontend-console.png?raw=true)
![Example backend API / MQTT producer](images/example-backend-producer.png?raw=true)
![Example backend MQTT consumer](images/example-backend-consumer.png?raw=true)

## Prerequisites

* **Git:** Ensure Git is installed on your Windows machine.
* **Node.js:** Runs server-side JavaScript for the backend API and the MQTT publisher/consumer. [Download Node](https://nodejs.org/en/download/)

## Installation

1. **Clone the repository:**
   * Open Git Bash.
   * Navigate to the directory where you want to store the project.
   * Clone the repository: `git clone git@github.com:andrewmelvin-dev/mqtt-websocket-example.git`

2. **Navigate to the project directory:**
   * `cd mqtt-websocket-example`

3. **Navigate to the directory containing the backend API/producer and install the required packages:**
   * `cd backend-api-producer && npm install`

4. **Navigate to the directory containing the backend consumer and install the required packages:**
   * `cd ../backend-consumer && npm install`

5. **Navigate to the directory containing the frontend and install the required packages:**
   * `cd ../frontend && npm install`

## Running the project

1. **Start the backend API and producer that will provide data and publish updates:**
   * Open a new terminal window in the `backend-api-producer` directory.
   * Start the API and producer: `npm start`
   * By default the API/producer will run on port 3001.

2. **Start the backend consumer that will consume updates and sent them to the frontend:**
   * Open a new terminal window in the `backend-consumer` directory.
   * Start the consumer: `npm start`

3. **Start the frontend server that will serve files to the web browser:**
   * Open a new terminal window in the `frontend` directory.
   * Start the API and producer: `npm run dev`

4. **Access the frontend:**
   * Open a new browser window and load the following url: `http://localhost:3000/`

## Instructions

### UI Overview

The application consists of: 1) A map of devices 2) A device view/edit section 3) A simulator controller.

### Device viewing and updating

Devices can be clicked on the map, at which point their details will be loaded into the view/edit section. Updates can
be made to specific devices, which will push the update to the server and other connected frontend browsers.

### The simulator controller

The simulator controller will allow you to start, stop, and configure the simulator that runs on the server. The
simulator will periodically change the status of some of the devices, and these updates will flow through to all
connected frontend browsers.

In real life, the devices themselves would communicate via MQTT to the producer (or would act as producers themselves)
rather than having updates simulated as they are in this project.

* Configuration options include setting the chance of updates occuring, the number of devices affected in an update,
and how often updates occur.
* Enter the desired configuration, and then press the "Start Simulator" button to start the simulation.
* If you want to stop the simulator press the "Stop Simulator" button. The configuration can then be changed, and the
simulator restarted, if desired.

Note: it is possible that a device being viewed/edited may be updated by the backend simulator during the view/edit
process. Management of this edge case is not included in the scope of this project.
