"use client";
import { useState } from "react";

export default function DockerForm() {
  const [repoUrl, setRepoUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [output, setOutput] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOutput("Starting build...\n");

    try {
      const res = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, accessToken, imageName: "mydockerimage:latest" }),
      });

      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setOutput("Error: " + err);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Generate Docker Image</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" placeholder="GitHub Repo URL" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className="border p-2 rounded"/>
        <input type="text" placeholder="Personal Access Token" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} className="border p-2 rounded"/>
        <button type="submit" className="bg-blue-500 text-white py-2 rounded">Generate & Build Image</button>
      </form>
      {output && <pre className="mt-4 p-4 bg-gray-100 border rounded whitespace-pre-wrap">{output}</pre>}
    </div>
  );
}
