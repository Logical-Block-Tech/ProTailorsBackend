# Step 1: Use the official Node.js image as the base
FROM node:16-alpine

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Step 4: Install application dependencies
RUN npm install

# Step 5: Copy the rest of the application source code
COPY . .

# Step 6: Expose the application port (change 3000 to your app's port)
EXPOSE 5000

# Step 7: Command to start the application
CMD ["npm", "start"]
