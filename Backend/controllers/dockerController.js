const { createDockerfile, buildDockerImage } = require("../services/dockerService");

exports.generateDockerfile = async (req, res) => {
  try {
    const { repoUrl, pat } = req.body;
    const dockerfile = await createDockerfile(repoUrl, pat);
    await buildDockerImage(dockerfile, repoUrl);
    res.json({ dockerfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate Dockerfile" });
  }
};
