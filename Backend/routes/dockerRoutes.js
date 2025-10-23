const express = require("express");
const { generateDockerfile } = require("../controllers/dockerController");
const router = express.Router();

router.post("/generate", generateDockerfile);

module.exports = router;
