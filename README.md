# NestJS Docker Jest and Typeorm application
### Pre-requisites:

Before you get started, ensure you have Docker installed on your machine. If Docker is not installed, download and install it from the official [Docker website](https://docs.docker.com/get-docker/).

### Installation & Running the Application:

1. **Setting Up Docker Compose**:

   - Docker Compose is used to define and run multi-container Docker applications. With a YAML file (`docker-compose.yml`), you can configure your application’s services, networks, and volumes, and then start everything with a single command.
   - For the Treeo application, Docker Compose is used to set up and link the application server (running NestJS) and the PostgreSQL database.

2. **Running the Application in Development**:
   - Open a terminal or command prompt.
   - Navigate to the root directory of the Treeo application where the `docker-compose.yml` file is located.
   - Run the following command to build and start the application in development mode:
     ```bash
     docker compose up --build
     ```
   - The `--build` option tells Docker Compose to build the images before starting the containers. This is particularly useful since we need to build the application wheilr including the `node_modules` directory in the image.

### Testing the Application:

1. **Unit Tests**:

   - Unit tests are designed to test individual parts of your code in isolation.
   - For running unit tests that don't require Docker (i.e., they can run outside the container or don't depend on other services like the database), we shall use:
     ```bash
     npm run test
     ```
   - Ensure you have Node.js and npm installed to run this command, and it should be executed in the root directory of your application where the `package.json` file is located.

2. **End-to-End (E2E) Tests**:
   - E2E tests are used to test your application as a whole, ensuring that all components work together as expected.
   - To run E2E tests that depend on other Docker services (for our case the database), use the following command:
     ```bash
     docker compose -f docker-compose.test.yaml up --abort-on-container-exit --remove-orphans
     ```
   - This command uses a different Docker Compose file (`docker-compose.test.yaml`) designed specifically for testing. It starts the necessary services for testing, runs the tests, and then stops and removes the containers automatically. The `--abort-on-container-exit` option stops all containers if any container was stopped, and `--remove-orphans` removes any containers that are not defined in the Docker Compose file but are linked to the services defined in it.

### Summary:

- Ensure Docker is installed.
- Use `docker compose up --build` to start your development environment.
- Run unit tests with `npm run test` (requires Node.js and npm).
- Execute E2E tests with Docker Compose using a specific configuration for testing.

By following these steps, you can get the Treeo application running on your machine for development and testing purposes.
