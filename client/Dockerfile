# Use Node.js as the base image
FROM node:20

# Create app directory
RUN mkdir -p /opt/app

# Set working directory
WORKDIR /opt/app

# Add user app
RUN adduser --disabled-password app


# Copy source files to WORKDIR
COPY . .

# Change ownership to app user
RUN chown -R app:app /opt/app

# Switch to app user
USER app

# Install dependencies
RUN npm install

# Expose port 5173
EXPOSE 5173

# Start the app
CMD [ "npm", "start" ]