module.exports = {
  apps: [
    {
      name: "delizisioo-api",
      cwd: __dirname,
      script: "dist/server.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3009,
      },
    },
  ],
};
