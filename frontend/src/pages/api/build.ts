import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { repoUrl, accessToken, imageName } = req.body;
  if (!repoUrl || !accessToken) return res.status(400).json({ error: "Repo URL and access token are required" });

  const repoName = "temp-repo";
  const repoPath = path.join(process.cwd(), repoName);

  try {
    if (fs.existsSync(repoPath)) fs.rmSync(repoPath, { recursive: true, force: true });

    const authRepoUrl = repoUrl.replace("https://", `https://${accessToken}@`);

    exec(`git clone "${authRepoUrl}" "${repoPath}"`, (cloneErr, cloneStdout, cloneStderr) => {
      if (cloneErr) return res.status(500).json({ error: "Git clone failed", details: cloneStderr });

      if (!fs.existsSync(path.join(repoPath, "Dockerfile"))) {
        return res.status(400).json({ error: "Dockerfile not found in the repo root." });
      }

      const tagName = imageName ? imageName : "myimage:latest";

      exec(`docker build -t ${tagName} "${repoPath}"`, (buildErr, buildStdout, buildStderr) => {
        if (buildErr) return res.status(500).json({ error: "Docker build failed", details: buildStderr });

        return res.status(200).json({ message: `Docker image '${tagName}' built successfully!`, output: buildStdout });
      });
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
