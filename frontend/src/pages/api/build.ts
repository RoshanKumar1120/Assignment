import type { NextApiRequest, NextApiResponse } from "next";
import { exec as execCb } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const exec = promisify(execCb);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { repoUrl, accessToken, imageName } = req.body;
  if (!repoUrl || !accessToken) {
    return res.status(400).json({ error: "Repo URL and access token are required" });
  }

  const repoName = "temp-repo";
  const repoPath = path.join(process.cwd(), repoName);

  try {
    // Remove old repo if exists
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
    }

    // Add access token to URL
    const authRepoUrl = repoUrl.replace("https://", `https://${accessToken}@`);

    // Clone the repo
    await exec(`git clone "${authRepoUrl}" "${repoPath}"`);

    // Check Dockerfile
    const dockerfilePath = path.join(repoPath, "Dockerfile");
  if (!fs.existsSync(dockerfilePath) || !fs.lstatSync(dockerfilePath).isFile()) {
    return res.status(400).json({ error: "Dockerfile not found or is not a file." });
  }


    // Build image
    const tagName = imageName ? imageName : "myimage:latest";
    const { stdout, stderr } = await exec(`docker build -t ${tagName} "${repoPath}"`);

    return res.status(200).json({
      message: `Docker image '${tagName}' built successfully!`,
      output: stdout || stderr,
    });
  } catch (err: any) {
    console.error("Error during /api/build:", err.message || err);
    return res.status(500).json({
      error: "Docker build failed",
      details: err.message || err.toString(),
    });
  }
}
