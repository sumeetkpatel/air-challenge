module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      "name": 'air-challenge-server',
      "script": 'bin/www',
      "watch": true,
      "ignore_watch": [".git", "node_modules", "logs", "README.md", "INSTALLATION.md"],
      "kill_timeout": 3000,
      "log_file": "logs/main.log",
      "error_file": "logs/main.log",
      "merge_logs": true,
      "log_date_format": "YYYY-MM-DD HH:mm",
      "env": {
      },
      "env_production": {
        "NODE_ENV": 'production',
      }
    },
  ]
};