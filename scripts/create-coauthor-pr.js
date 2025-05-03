const { Octokit } = require('@octokit/rest');

const token = process.env.GITHUB_TOKEN;
const repo = process.env.REPO;
const actor = process.env.ACTOR;

// Number of PRs to create per run (default 5)
const PRS_PER_RUN = parseInt(process.env.PRS_PER_RUN) || 5;

// Delay between PR creations in ms (default 30000ms = 30 seconds)
const DELAY_MS = parseInt(process.env.DELAY_MS) || 30000;

if (!token || !repo || !actor) {
  console.error('Missing required environment variables.');
  process.exit(1);
}

const octokit = new Octokit({ auth: token });

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createAndMergePR(index) {
  try {
    const [owner, repoName] = repo.split('/');

    // Generate a unique branch name
    const branchName = `coauthor-pr-${Date.now()}-${index}`;

    // Get default branch
    const { data: repoData } = await octokit.repos.get({ owner, repo: repoName });
    const defaultBranch = repoData.default_branch;

    // Get the latest commit SHA of default branch
    const { data: refData } = await octokit.git.getRef({ owner, repo: repoName, ref: `heads/${defaultBranch}` });
    const latestCommitSha = refData.object.sha;

    // Create new branch
    await octokit.git.createRef({
      owner,
      repo: repoName,
      ref: `refs/heads/${branchName}`,
      sha: latestCommitSha,
    });

    // Create a new file or update a file with a commit containing coauthor trailer
    const filePath = `coauthor-badge-${index}.txt`;
    const content = `This commit is to get the Pair Extraordinaire badge.\n\nCo-authored-by: Fake Coauthor <fakecoauthor@example.com>\n`;
    const contentEncoded = Buffer.from(content).toString('base64');

    // Check if file exists to get its SHA
    let fileSha = null;
    try {
      const { data: fileData } = await octokit.repos.getContent({ owner, repo: repoName, path: filePath, ref: branchName });
      fileSha = fileData.sha;
    } catch (e) {
      // File does not exist, will create new
    }

    // Create or update file with commit
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: filePath,
      message: 'Add coauthor trailer commit for badge',
      content: contentEncoded,
      branch: branchName,
      sha: fileSha || undefined,
    });

    // Create pull request
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo: repoName,
      title: 'Coauthor Badge PR',
      head: branchName,
      base: defaultBranch,
      body: 'This PR is created to get the Pair Extraordinaire badge.',
    });

    // Merge pull request
    await octokit.pulls.merge({
      owner,
      repo: repoName,
      pull_number: pr.number,
      merge_method: 'merge',
    });

    console.log(`Pull request #${pr.number} created and merged successfully.`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function run() {
  for (let i = 1; i <= PRS_PER_RUN; i++) {
    await createAndMergePR(i);
    if (i < PRS_PER_RUN) {
      console.log(`Waiting ${DELAY_MS / 1000} seconds before next PR...`);
      await delay(DELAY_MS);
    }
  }
}

run();
