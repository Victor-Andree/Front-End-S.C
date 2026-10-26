const { spawn } = require('node:child_process')

const environments = {
  local: 'http://localhost:8080',
  qa: 'http://localhost:8081',
}

const environment = process.argv[2]
const command = process.argv[3]

if (!Object.hasOwn(environments, environment) || !['dev', 'build'].includes(command)) {
  console.error('Uso: node scripts/run-next.cjs <local|qa> <dev|build>')
  process.exit(1)
}

const nextBin = require.resolve('next/dist/bin/next')
const args = [nextBin, command]
if (command === 'build') args.push('--webpack')

console.log(`Frontend ${environment.toUpperCase()} → ${environments[environment]}`)

const child = spawn(process.execPath, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_API_URL: environments[environment],
  },
})

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 1)
})
