module.exports = {
  apps : [{
    name: 'home-monitor',
    script: './server.js',
    exp_backoff_restart_delay: 500,

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    log_date_format:"DD-MM-YYYY HH:mm Z",
    node_args:"--harmony",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

};
