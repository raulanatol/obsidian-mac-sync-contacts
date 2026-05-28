import { spawn } from 'child_process';

export const runOsaScript = (script: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const command = spawn('osascript', ['-e', script]);
    let output = '';
    let errorOutput = '';

    command.stdout.on('data', data => {
      output += data;
    });

    command.stderr.on('data', data => {
      errorOutput += data;
    });

    command.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`Command failed with exit code ${code}: ${errorOutput}`));
      }
      resolve(output);
    });

    command.on('error', error => {
      reject(error);
    });
  });
};
