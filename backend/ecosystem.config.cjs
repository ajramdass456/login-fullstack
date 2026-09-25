module.exports = {
  apps: [
    {
      name: 'login-engine',          // The identity tag of your server cluster
      script: './src/index.js',      // The main entry point file of your Express server
      instances: 'max',              // Tells PM2 to deploy one clone for every CPU core you have
      exec_mode: 'cluster',          // CRITICAL: Forces PM2 to act as a local network Load Balancer
      watch: false,                  // Keep false during high-traffic benchmarking to maximize performance
      max_memory_restart: '1G',      // Automatically recycles a node instance if it hits 1GB of RAM leakage
      env: {
        NODE_ENV: 'development',     // Injects baseline runtime flags
      }
    }
  ]
};