import { Octokit } from "@octokit/rest";

const token = process.env.MY_GITHUB_TOKEN;
const octokit = new Octokit({ auth: token });

const repoOwner = 'morningstarxcdcode'; // Your GitHub username
const repoName = 'Pair-Extraordinaire-Badge-Automation'; // Your repository name

const prsPerRun = 5; // Number of PRs to create per workflow run
const delayMs = 10000; // Delay between PR creations in milliseconds

async function createAndMergePR(index) {
  try {
    const branchName = `coauthor-badge-branch-${Date.now()}-${index}`;
    const baseBranch = 'main';

    // Get the latest commit SHA of the base branch
    const baseBranchData = await octokit.repos.getBranch({
      owner: repoOwner,
      repo: repoName,
      branch: baseBranch,
    });
    const baseCommitSha = baseBranchData.data.commit.sha;

    // Create a new branch from the base branch
    await octokit.git.createRef({
      owner: repoOwner,
      repo: repoName,
      ref: `refs/heads/${branchName}`,
      sha: baseCommitSha,
    });

    // Create a new file content
    const filePath = `coauthored-file-${Date.now()}-${index}.txt`;
    const fileContent = `This is a coauthored commit file #${index}`;

    // Create a blob for the new file
    const blob = await octokit.git.createBlob({
      owner: repoOwner,
      repo: repoName,
      content: Buffer.from(fileContent).toString('base64'),
      encoding: 'base64',
    });

    // Get the tree SHA of the base commit
    const baseCommitData = await octokit.git.getCommit({
      owner: repoOwner,
      repo: repoName,
      commit_sha: baseCommitSha,
    });
    const baseTreeSha = baseCommitData.data.tree.sha;

    // Create a new tree with the new blob
    const newTree = await octokit.git.createTree({
      owner: repoOwner,
      repo: repoName,
      base_tree: baseTreeSha,
      tree: [
        {
          path: filePath,
          mode: '100644',
          type: 'blob',
          sha: blob.data.sha,
        },
      ],
    });

    // Create a new commit with coauthor trailer
    const commitMessage = `feat: coauthored commit #${index}\n\nCo-authored-by: Fake User <fakeuser@example.com>`;
    const newCommit = await octokit.git.createCommit({
      owner: repoOwner,
      repo: repoName,
      message: commitMessage,
      tree: newTree.data.sha,
      parents: [baseCommitSha],
    });

    // Update the branch ref to point to the new commit
    await octokit.git.updateRef({
      owner: repoOwner,
      repo: repoName,
      ref: `heads/${branchName}`,
      sha: newCommit.data.sha,
    });

    // Create a pull request
    const pr = await octokit.pulls.create({
      owner: repoOwner,
      repo: repoName,
      title: `Coauthored PR #${index}`,
      head: branchName,
      base: baseBranch,
      body: 'Automated coauthored pull request to earn Pair Extraordinaire badge.',
    });

    // Merge the pull request
    await octokit.pulls.merge({
      owner: repoOwner,
      repo: repoName,
      pull_number: pr.data.number,
      merge_method: 'merge',
    });

    console.log(`Successfully created and merged PR #${index}`);
  } catch (error) {
    console.error(`Error in PR #${index}:`, error);
  }
}

async function run() {
  for (let i = 1; i <= prsPerRun; i++) {
    await createAndMergePR(i);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
}

run();
