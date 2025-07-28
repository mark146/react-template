const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = path.resolve(__dirname, '../../.env');
const pkg = require(path.resolve(__dirname, '../../package.json'));
const version = pkg.version;
const buildTime = new Date().toISOString();
const buildHash = execSync('git rev-parse --short HEAD').toString().trim();
const nodeVersion = process.version;

// 갱신할 키 목록
const updateKeys = [
    'VITE_APP_VERSION',
    'VITE_BUILD_TIME',
    'VITE_BUILD_HASH',
    'VITE_NODE_VERSION'
];

// 기존 .env 읽기
let envLines = [];
if (fs.existsSync(envPath)) {
    envLines = fs.readFileSync(envPath, 'utf-8').split('\n');
}

// 기존 값 중 갱신할 키 제외
envLines = envLines.filter(
    line => !updateKeys.some(key => line.startsWith(key + '='))
);

// 새 값 추가
envLines.push(`VITE_APP_VERSION=${version}`);
envLines.push(`VITE_BUILD_TIME=${buildTime}`);
envLines.push(`VITE_BUILD_HASH=${buildHash}`);
envLines.push(`VITE_NODE_VERSION=${nodeVersion}`);

// 파일 저장
fs.writeFileSync(envPath, envLines.join('\n') + '\n');