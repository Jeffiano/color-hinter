const { exec } = require('child_process');

console.log('Starting Next.js build...');

exec('npx next build', (error, stdout, stderr) => {
  if (error) {
    console.error('Build failed with error:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.error('Build stderr:', stderr);
  }
  
  console.log('Build stdout:', stdout);
  console.log('Build completed successfully!');
});
