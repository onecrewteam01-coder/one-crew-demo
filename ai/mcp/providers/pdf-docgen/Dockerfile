# PDF Document Generator MCP provider (document-generator-mcp).
#
# Runs as a Docker-packaged stdio MCP server, mirroring how the Office MCP is
# deployed via Docker. The MCP client launches `docker run -i ...` and speaks
# the MCP protocol over the container's stdin/stdout.
#
# Version PINNED exactly per the MCP security policy — review the upstream
# changelog before bumping.
FROM node:22-alpine

# Install the pinned server globally.
RUN npm install -g document-generator-mcp@1.0.9

# The server writes generated files to <cwd>/generated_documents.
# Pin the working directory so that path is stable and mountable.
WORKDIR /data

# Run the server entry directly with node (avoids shebang/PATH assumptions).
# Global npm packages on this image live under /usr/local/lib/node_modules.
ENTRYPOINT ["node", "/usr/local/lib/node_modules/document-generator-mcp/build/index.js"]
