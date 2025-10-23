const { exec } = require("child_process");
const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.createDockerfile = async (repoUrl, pat) => {
  const repoName = path.basename(repoUrl, ".git");
  const repoPath = path.join(__dirname, "..", "repos", repoName);

  // Clone repo
  await simpleGit().clone(repoUrl, repoPath, {
    "--depth": 1,
    "--branch": "main",
  });

  // Detect tech stack
  const packageJson = require(path.join(repoPath, "package.json"));
  const framework = packageJson.dependencies.react
    ? "React"
    : packageJson.dependencies.next
    ? "Next.js"
    : packageJson.dependencies.vue
    ? "Vue"
    : "Unknown";

  // Generate Dockerfile using OpenAI
  const prompt = `Generate a Dockerfile for a ${framework} project located at ${repoPath}. The Dockerfile should be ready to build and run.`;
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  const dockerfile = response.choices[0].message.content;
  fs.writeFileSync(path.join(repoPath, "Dockerfile"), dockerfile);

  return dockerfile;
};

exports.buildDockerImage = async (dockerfile, repoUrl) => {
  const repoName = path.basename(repoUrl, ".git");
  const repoPath = path.join(__dirname, "..", "repos", repoName);

  await new Promise((resolve, reject) => {
    exec(`docker build -t ${repoName.toLowerCase()}:latest .`, { cwd: repoPath }, (err, stdout, stderr) => {
      if (err) return reject(err);
      console.log(stdout);
      resolve(stdout);
    });
  });
};
